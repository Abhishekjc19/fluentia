import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase, supabaseAdmin } from '../config/supabase';

const router = Router();

/**
 * Sign Up
 * POST /api/auth/signup
 */
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('full_name').trim().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, full_name } = req.body;

      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in Supabase (using admin client to bypass RLS)
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert([
          {
            email,
            password: hashedPassword,
            full_name,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
        },
        token,
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

/**
 * Login
 * POST /api/auth/login
 */
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      console.log('🔐 Login attempt:', { email });

      // Get user from database
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        console.log('❌ User not found:', email);
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      console.log('✅ User found, verifying password...');

      // Check if password field exists
      if (!user.password) {
        console.log('❌ User has no password hash stored!');
        res.status(500).json({ error: 'Account setup incomplete. Please contact support.' });
        return;
      }

      // Log hash format for debugging
      console.log('🔍 Password hash info:', {
        hashLength: user.password?.length,
        hashPrefix: user.password?.substring(0, 7),
        inputPasswordLength: password.length,
      });

      // Verify password with STRICT validation
      console.log('🔍 About to verify password...');
      let isValidPassword: boolean;
      try {
        isValidPassword = await bcrypt.compare(password, user.password);
        console.log(
          '🔑 Password verification result:',
          isValidPassword,
          '| Type:',
          typeof isValidPassword,
          '| Strict check:',
          isValidPassword === true
        );
      } catch (bcryptError) {
        console.error('❌ Bcrypt comparison error:', bcryptError);
        res.status(500).json({ error: 'Password verification failed' });
        return;
      }

      // CRITICAL: Triple-check password validation
      if (!isValidPassword || isValidPassword !== true || typeof isValidPassword !== 'boolean') {
        console.log('❌ AUTHENTICATION FAILED - Invalid password for user:', email);
        console.log('❌ Rejection reason:', {
          notTruthy: !isValidPassword,
          notStrictTrue: isValidPassword !== true,
          notBoolean: typeof isValidPassword !== 'boolean',
        });
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      console.log('✅ AUTHENTICATION SUCCESS - Password valid for user:', email);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      const responseData = {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
        token,
      };

      console.log('📤 Sending success response for:', email);
      res.json(responseData);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }
);

/**
 * Logout (client-side token removal)
 * POST /api/auth/logout
 */
router.post('/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
});

/**
 * DEBUG: Check user password hash (REMOVE IN PRODUCTION)
 * GET /api/auth/debug-user/:email
 */
router.get('/debug-user/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, password, full_name, created_at')
      .eq('email', email)
      .single();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
      hasPassword: !!user.password,
      passwordHashLength: user.password?.length,
      passwordHashPrefix: user.password?.substring(0, 7),
      isBcryptHash: user.password?.startsWith('$2b$') || user.password?.startsWith('$2a$'),
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
});

/**
 * DEBUG: Test password verification
 * POST /api/auth/test-password
 */
router.post('/test-password', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);

    res.json({
      email: user.email,
      passwordProvided: password.length + ' chars',
      hashStored: user.password?.substring(0, 20) + '...',
      isValidPassword: isValid,
      result: isValid ? '✅ CORRECT PASSWORD' : '❌ WRONG PASSWORD',
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: 'Test failed' });
  }
});

export default router;

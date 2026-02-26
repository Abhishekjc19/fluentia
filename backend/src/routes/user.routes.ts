import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

/**
 * Get current user profile
 * GET /api/users/me
 */
router.get(
  '/me',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, full_name, created_at')
        .eq('id', userId)
        .single();

      if (error || !user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }
);

/**
 * Get user statistics
 * GET /api/users/stats
 */
router.get(
  '/stats',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      // Get interview count
      const { count: totalInterviews } = await supabaseAdmin
        .from('interviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get completed interviews
      const { data: completedInterviews } = await supabaseAdmin
        .from('interviews')
        .select('score')
        .eq('user_id', userId)
        .eq('status', 'completed');

      const avgScore = completedInterviews && completedInterviews.length > 0
        ? completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / completedInterviews.length
        : 0;

      res.json({
        stats: {
          totalInterviews: totalInterviews || 0,
          completedInterviews: completedInterviews?.length || 0,
          averageScore: Math.round(avgScore * 10) / 10
        }
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ error: 'Failed to get user statistics' });
    }
  }
);

export default router;

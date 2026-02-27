# Contributing to Fluentia

Thank you for your interest in contributing to Fluentia! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** explaining why this would be useful
- **Possible implementation** (if you have ideas)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm run install:all`
3. **Make your changes** following our code style
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Commit with clear messages** following our commit conventions
7. **Push to your fork** and submit a pull request

## Development Setup

See [SETUP.md](SETUP.md) for detailed setup instructions.

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### React Components

- Use functional components with hooks
- Extract reusable logic to custom hooks
- Keep components focused on a single responsibility
- Use TypeScript interfaces for props

### Backend Code

- Use async/await for asynchronous operations
- Proper error handling with try-catch
- Validate all inputs
- Add appropriate logging
- Follow RESTful conventions

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow the existing design system
- Ensure responsive design
- Test on multiple screen sizes

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(interview): add video playback feature
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
```

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Writing Tests

- Write tests for new features
- Update tests when modifying existing features
- Aim for good coverage of critical paths
- Test edge cases and error conditions

## Documentation

- Update README.md for user-facing changes
- Update API-DOCUMENTATION.md for API changes
- Add JSDoc comments for complex functions
- Update SETUP.md for setup changes

## Project Structure

Understand the project structure before making changes:

```
frontend/
  src/
    components/     # Reusable UI components
    pages/          # Page components
    store/          # State management
    lib/            # Utilities and helpers
    types/          # TypeScript definitions

backend/
  src/
    config/         # Configuration
    middleware/     # Express middleware
    routes/         # API routes
    types/          # TypeScript definitions
```

## Review Process

1. **Automated checks** must pass (linting, tests)
2. **Code review** by at least one maintainer
3. **Testing** in review environment
4. **Documentation** review if applicable
5. **Merge** after approval

## Questions?

Feel free to:

- Open an issue for discussion
- Ask in pull request comments
- Reach out to maintainers

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to Fluentia! 🎉

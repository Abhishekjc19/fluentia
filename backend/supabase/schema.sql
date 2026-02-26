-- Fluentia Mock Interview Platform Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interviews table
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interview_type VARCHAR(20) NOT NULL CHECK (interview_type IN ('tech', 'hr')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('in_progress', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    score DECIMAL(3, 1),
    feedback TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answers table
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    answer_audio_url TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 10),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_questions_interview_id ON questions(interview_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can view and manage their own interviews
CREATE POLICY "Users can view own interviews" ON interviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interviews" ON interviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews" ON interviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can view questions for their interviews
CREATE POLICY "Users can view questions for own interviews" ON questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM interviews
            WHERE interviews.id = questions.interview_id
            AND interviews.user_id = auth.uid()
        )
    );

-- Users can view and create answers for their questions
CREATE POLICY "Users can view answers for own questions" ON answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM questions
            JOIN interviews ON interviews.id = questions.interview_id
            WHERE questions.id = answers.question_id
            AND interviews.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create answers for own questions" ON answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM questions
            JOIN interviews ON interviews.id = questions.interview_id
            WHERE questions.id = answers.question_id
            AND interviews.user_id = auth.uid()
        )
    );

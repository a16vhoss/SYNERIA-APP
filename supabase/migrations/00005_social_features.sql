-- 00005_social_features.sql
-- Syneria Social: portfolio, recommendations, groups, feed interactions

-- 1. PORTFOLIO ITEMS
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  description TEXT CHECK (char_length(description) <= 500),
  type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'document')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL,
  duration INTEGER,
  project_date DATE,
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_portfolio_user ON portfolio_items(user_id);
CREATE INDEX idx_portfolio_type ON portfolio_items(user_id, type);
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view portfolio items" ON portfolio_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own portfolio items" ON portfolio_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio items" ON portfolio_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolio items" ON portfolio_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. RECOMMENDATIONS
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN ('coworker', 'same_project', 'same_sector', 'acquaintance')),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 20 AND 500),
  highlighted_skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(author_id, recipient_id),
  CHECK(author_id != recipient_id)
);
CREATE INDEX idx_recommendations_recipient ON recommendations(recipient_id);
CREATE INDEX idx_recommendations_author ON recommendations(author_id);
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view recommendations" ON recommendations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own recommendations" ON recommendations FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own recommendations" ON recommendations FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own recommendations" ON recommendations FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- 3. GROUPS
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 500),
  icon_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('sector', 'country', 'interest')),
  creator_id UUID NOT NULL REFERENCES profiles(id),
  member_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_groups_category ON groups(category);
CREATE INDEX idx_groups_creator ON groups(creator_id);
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view public groups" ON groups FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Users can create groups" ON groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Group creator can update" ON groups FOR UPDATE TO authenticated USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

-- 4. GROUP MEMBERS
CREATE TABLE group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);
CREATE INDEX idx_group_members_user ON group_members(user_id);
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view group members" ON group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join groups" ON group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON group_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. GROUP POSTS
CREATE TABLE group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  media_urls TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_group_posts_group ON group_posts(group_id, created_at DESC);
CREATE INDEX idx_group_posts_author ON group_posts(author_id);
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view posts" ON group_posts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = group_posts.group_id AND group_members.user_id = auth.uid()));
CREATE POLICY "Group members can create posts" ON group_posts FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = group_posts.group_id AND group_members.user_id = auth.uid()) AND auth.uid() = author_id);
CREATE POLICY "Authors can delete own posts" ON group_posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- 6. POST LIKES (polymorphic)
CREATE TABLE post_likes (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('activity', 'portfolio', 'recommendation', 'group_post')),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);
CREATE INDEX idx_post_likes_post ON post_likes(post_id, post_type);
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view likes" ON post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. POST COMMENTS (polymorphic)
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('activity', 'portfolio', 'recommendation', 'group_post')),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_comments_post ON post_comments(post_id, post_type);
CREATE INDEX idx_comments_author ON post_comments(author_id);
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view comments" ON post_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON post_comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- 8. TRIGGERS
CREATE OR REPLACE FUNCTION update_group_member_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_group_member_count
AFTER INSERT OR DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

CREATE OR REPLACE FUNCTION auto_add_group_creator() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role) VALUES (NEW.id, NEW.creator_id, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_add_group_creator
AFTER INSERT ON groups
FOR EACH ROW EXECUTE FUNCTION auto_add_group_creator();

CREATE OR REPLACE FUNCTION update_portfolio_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_portfolio_updated_at
BEFORE UPDATE ON portfolio_items
FOR EACH ROW EXECUTE FUNCTION update_portfolio_updated_at();

-- 9. STORAGE BUCKET: portfolio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio', 'portfolio', true, 104857600,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf']
);

CREATE POLICY "Anyone can view portfolio files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'portfolio');
CREATE POLICY "Users can upload own portfolio files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own portfolio files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own portfolio files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

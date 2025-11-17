-- Delete all existing data
DELETE FROM story_views;
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM follows;
DELETE FROM messages;
DELETE FROM stories;
DELETE FROM posts;
DELETE FROM profiles;

-- Note: auth.users will be cleaned up automatically due to cascade delete
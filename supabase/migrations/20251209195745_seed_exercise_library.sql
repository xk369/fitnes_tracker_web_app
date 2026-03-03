/*
  # Seed Exercise Library with Base Exercises

  ## Overview
  Populates the exercises table with 25 fundamental exercises covering all major muscle groups
  and various equipment types. These are system-created exercises (created_by = NULL) and
  publicly available to all users.

  ## Exercises Added
  
  ### Chest Exercises
  1. Barbell Bench Press
  2. Dumbbell Bench Press
  3. Push-ups
  4. Dumbbell Flyes

  ### Back Exercises
  5. Pull-ups
  6. Barbell Bent-Over Row
  7. Lat Pulldown
  8. Dumbbell Row

  ### Leg Exercises
  9. Barbell Squat
  10. Romanian Deadlift
  11. Leg Press
  12. Lunges
  13. Leg Curl

  ### Shoulder Exercises
  14. Overhead Press
  15. Dumbbell Lateral Raise
  16. Front Raise
  17. Face Pulls

  ### Arms Exercises
  18. Barbell Curl
  19. Dumbbell Hammer Curl
  20. Tricep Dips
  21. Cable Tricep Pushdown

  ### Core Exercises
  22. Plank
  23. Crunches
  24. Russian Twists
  25. Hanging Leg Raises
*/

-- Insert chest exercises
INSERT INTO exercises (name, description, video_url, muscle_groups, equipment_type, difficulty_level, exercise_type, created_by, is_public) VALUES
('Barbell Bench Press', 'Classic compound chest exercise. Lie on a bench, lower the barbell to chest, and press up.', 'https://www.youtube.com/watch?v=gRVjAtPip0Y', ARRAY['chest', 'triceps', 'shoulders'], 'barbell', 'intermediate', 'compound', NULL, true),
('Dumbbell Bench Press', 'Dumbbell variation of bench press allowing for greater range of motion and unilateral training.', 'https://www.youtube.com/watch?v=VmB1G1K7v94', ARRAY['chest', 'triceps', 'shoulders'], 'dumbbells', 'beginner', 'compound', NULL, true),
('Push-ups', 'Fundamental bodyweight chest exercise that can be performed anywhere.', 'https://www.youtube.com/watch?v=IODxDxX7oi4', ARRAY['chest', 'triceps', 'shoulders', 'core'], 'bodyweight', 'beginner', 'compound', NULL, true),
('Dumbbell Flyes', 'Isolation exercise for chest focusing on stretch and contraction.', 'https://www.youtube.com/watch?v=eozdVDA78K0', ARRAY['chest'], 'dumbbells', 'intermediate', 'isolation', NULL, true);

-- Insert back exercises
INSERT INTO exercises (name, description, video_url, muscle_groups, equipment_type, difficulty_level, exercise_type, created_by, is_public) VALUES
('Pull-ups', 'Compound upper body exercise targeting back and biceps. Hang from bar and pull body up.', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', ARRAY['back', 'biceps', 'forearms'], 'bodyweight', 'intermediate', 'compound', NULL, true),
('Barbell Bent-Over Row', 'Fundamental rowing movement for back thickness. Bend at hips, pull barbell to lower chest.', 'https://www.youtube.com/watch?v=kBWAon7ItDw', ARRAY['back', 'biceps', 'forearms'], 'barbell', 'intermediate', 'compound', NULL, true),
('Lat Pulldown', 'Machine exercise targeting lats. Pull bar down to upper chest.', 'https://www.youtube.com/watch?v=CAwf7n6Luuc', ARRAY['back', 'biceps'], 'machine', 'beginner', 'compound', NULL, true),
('Dumbbell Row', 'Unilateral rowing exercise allowing focus on each side of the back.', 'https://www.youtube.com/watch?v=roCP6wCXPqo', ARRAY['back', 'biceps'], 'dumbbells', 'beginner', 'compound', NULL, true);

-- Insert leg exercises
INSERT INTO exercises (name, description, video_url, muscle_groups, equipment_type, difficulty_level, exercise_type, created_by, is_public) VALUES
('Barbell Squat', 'King of leg exercises. Bar on back, squat down and drive through heels.', 'https://www.youtube.com/watch?v=ultWZbUMPL8', ARRAY['quadriceps', 'glutes', 'hamstrings', 'core'], 'barbell', 'intermediate', 'compound', NULL, true),
('Romanian Deadlift', 'Hip hinge movement targeting hamstrings and glutes.', 'https://www.youtube.com/watch?v=2SHsk9AzdjA', ARRAY['hamstrings', 'glutes', 'lower_back'], 'barbell', 'intermediate', 'compound', NULL, true),
('Leg Press', 'Machine-based compound leg exercise with reduced spinal loading.', 'https://www.youtube.com/watch?v=IZxyjW7MPJQ', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'machine', 'beginner', 'compound', NULL, true),
('Lunges', 'Unilateral leg exercise improving balance and leg strength.', 'https://www.youtube.com/watch?v=QOVaHwm-Q6U', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'bodyweight', 'beginner', 'compound', NULL, true),
('Leg Curl', 'Isolation exercise for hamstrings performed on machine.', 'https://www.youtube.com/watch?v=ELOCsoDSmrg', ARRAY['hamstrings'], 'machine', 'beginner', 'isolation', NULL, true);

-- Insert shoulder exercises
INSERT INTO exercises (name, description, video_url, muscle_groups, equipment_type, difficulty_level, exercise_type, created_by, is_public) VALUES
('Overhead Press', 'Compound shoulder exercise. Press barbell or dumbbells overhead from shoulder level.', 'https://www.youtube.com/watch?v=2yjwXTZQDDI', ARRAY['shoulders', 'triceps', 'core'], 'barbell', 'intermediate', 'compound', NULL, true),
('Dumbbell Lateral Raise', 'Isolation exercise for side delts. Raise dumbbells out to sides.', 'https://www.youtube.com/watch?v=3VcKaXpzqRo', ARRAY['shoulders'], 'dumbbells', 'beginner', 'isolation', NULL, true),
('Front Raise', 'Isolation exercise for front delts. Raise weight in front of body.', 'https://www.youtube.com/watch?v=qzZRRHZHFlw', ARRAY['shoulders'], 'dumbbells', 'beginner', 'isolation', NULL, true),
('Face Pulls', 'Excellent exercise for rear delts and upper back. Pull rope to face level.', 'https://www.youtube.com/watch?v=rep-qVOkqgk', ARRAY['shoulders', 'upper_back'], 'cable', 'beginner', 'isolation', NULL, true);

-- Insert arm exercises
INSERT INTO exercises (name, description, video_url, muscle_groups, equipment_type, difficulty_level, exercise_type, created_by, is_public) VALUES
('Barbell Curl', 'Classic bicep builder. Curl barbell from extended arms to shoulders.', 'https://www.youtube.com/watch?v=kwG2ipFRgfo', ARRAY['biceps', 'forearms'], 'barbell', 'beginner', 'isolation', NULL, true),
('Dumbbell Hammer Curl', 'Bicep exercise with neutral grip targeting brachialis.', 'https://www.youtube.com/watch?v=zC3nLlEvin4', ARRAY['biceps', 'forearms'], 'dumbbells', 'beginner', 'isolation', NULL, true),
('Tricep Dips', 'Compound bodyweight exercise for triceps. Lower and raise body using parallel bars.', 'https://www.youtube.com/watch?v=6kALZikXxLc', ARRAY['triceps', 'chest', 'shoulders'], 'bodyweight', 'intermediate', 'compound', NULL, true),
('Cable Tricep Pushdown', 'Isolation tricep exercise using cable machine. Push bar or rope down.', 'https://www.youtube.com/watch?v=2-LAMcpzODU', ARRAY['triceps'], 'cable', 'beginner', 'isolation', NULL, true);

-- Insert core exercises
INSERT INTO exercises (name, description, video_url, muscle_groups, equipment_type, difficulty_level, exercise_type, created_by, is_public) VALUES
('Plank', 'Isometric core exercise. Hold body in straight line supported by forearms and toes.', 'https://www.youtube.com/watch?v=ASdvN_XEl_c', ARRAY['core', 'abs', 'lower_back'], 'bodyweight', 'beginner', 'isolation', NULL, true),
('Crunches', 'Basic abdominal exercise. Lie on back and lift shoulders toward knees.', 'https://www.youtube.com/watch?v=Xyd_fa5zoEU', ARRAY['abs'], 'bodyweight', 'beginner', 'isolation', NULL, true),
('Russian Twists', 'Rotational core exercise working obliques. Twist torso side to side while seated.', 'https://www.youtube.com/watch?v=wkD8rjkodUI', ARRAY['obliques', 'abs'], 'bodyweight', 'beginner', 'isolation', NULL, true),
('Hanging Leg Raises', 'Advanced core exercise. Hang from bar and raise legs to horizontal.', 'https://www.youtube.com/watch?v=Pr1ieGZ5atk', ARRAY['abs', 'hip_flexors'], 'bodyweight', 'advanced', 'isolation', NULL, true);
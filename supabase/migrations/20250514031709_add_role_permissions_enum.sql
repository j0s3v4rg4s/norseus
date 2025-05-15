-- 1. Create the enum type for permission actions
CREATE TYPE permission_action AS ENUM ('read', 'edit', 'delete', 'create');

CREATE TYPE sections AS ENUM ('permissions', 'users');
sql
-- Create a backup table for the 'users' table
CREATE TABLE users_backup (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create a trigger to back up data before deleting from 'users'
DELIMITER //
CREATE TRIGGER backup_users_before_delete
BEFORE DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO users_backup (user_id, username, email, password, created_at, updated_at)
    VALUES (OLD.user_id, OLD.username, OLD.email, OLD.password, OLD.created_at, OLD.updated_at);
END;
//
DELIMITER ;

-- Create a backup table for the 'admins' table
CREATE TABLE admins_backup (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create a trigger to back up data before deleting from 'admins'
DELIMITER //
CREATE TRIGGER backup_admins_before_delete
BEFORE DELETE ON admins
FOR EACH ROW
BEGIN
    INSERT INTO admins_backup (admin_id, username, email, password, created_at, updated_at)
    VALUES (OLD.admin_id, OLD.username, OLD.email, OLD.password, OLD.created_at, OLD.updated_at);
END;
//
DELIMITER ;

-- Create a backup table for the 'roles' table
CREATE TABLE roles_backup (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create a trigger to back up data before deleting from 'roles'
DELIMITER //
CREATE TRIGGER backup_roles_before_delete
BEFORE DELETE ON roles
FOR EACH ROW
BEGIN
    INSERT INTO roles_backup (role_id, name, description, created_at, updated_at)
    VALUES (OLD.role_id, OLD.name, OLD.description, OLD.created_at, OLD.updated_at);
END;
//
DELIMITER ;

-- Create a backup table for the 'permissions' table
CREATE TABLE permissions_backup (
    permission_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create a trigger to back up data before deleting from 'permissions'
DELIMITER //
CREATE TRIGGER backup_permissions_before_delete
BEFORE DELETE ON permissions
FOR EACH ROW
BEGIN
    INSERT INTO permissions_backup (permission_id, name, description, created_at, updated_at)
    VALUES (OLD.permission_id, OLD.name, OLD.description, OLD.created_at, OLD.updated_at);
END;
//
DELIMITER ;

-- Create a backup table for the 'role_permissions' table
CREATE TABLE role_permissions_backup (
    role_permission_id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT,
    permission_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- Create a trigger to back up data before deleting from 'role_permissions'
DELIMITER //
CREATE TRIGGER backup_role_permissions_before_delete
BEFORE DELETE ON role_permissions
FOR EACH ROW
BEGIN
    INSERT INTO role_permissions_backup (role_permission_id, role_id, permission_id, created_at, updated_at)
    VALUES (OLD.role_permission_id, OLD.role_id, OLD.permission_id, OLD.created_at, OLD.updated_at);
END;
//
DELIMITER ;

-- Create a backup table for the 'user_roles' table
CREATE TABLE user_roles_backup (
    user_role_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    role_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Create a trigger to back up data before deleting from 'user_roles'
DELIMITER //
CREATE TRIGGER backup_user_roles_before_delete
BEFORE DELETE ON user_roles
FOR EACH ROW
BEGIN
    INSERT INTO user_roles_backup (user_role_id, user_id, role_id, created_at, updated_at)
    VALUES (OLD.user_role_id, OLD.user_id, OLD.role_id, OLD.created_at, OLD.updated_at);
END;
//
DELIMITER ;


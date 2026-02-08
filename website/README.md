# Myth War Online Website

This is the official website for Myth War Online, built with PHP 8.2 and Bootstrap 5.

## Requirements

- PHP 8.2 or higher
- MySQL 5.7 or higher (or MariaDB)
- PDO PHP Extension
- JSON PHP Extension

## Installation

1. Configure your database connection in `includes/db.php`.
   - Default is `localhost`, `root`, ``, `MythWarServer`.
   
2. Ensure your web server (Apache/Nginx/IIS) points to the `website` directory.

3. The website uses the same database as the Game Server (`MythWarServer`). Ensure you have run the game server initialization script (`InitDB.ts`) to create the necessary tables.

## Features

- **Home Page**: Full-screen hero slider, news section, download links.
- **Registration**: 1 Account per IP limit check enforced.
- **Login**: Secure login using `password_verify` (compatible with BCrypt).
- **User Profile**:
  - View all characters associated with the account.
  - Change password.
  - View account status.

## Directory Structure

- `assets/`: Javascript, CSS, Images (currently using CDNs for ease of deployment).
- `includes/`: Shared PHP files like database connection.
- `index.php`: Landing page.
- `login.php`, `register.php`, `profile.php`: Account management.

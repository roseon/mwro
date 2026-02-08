<?php require_once 'includes/db.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Myth War Online</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body {
            background-color: #121212;
            color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .navbar {
            background-color: rgba(0, 0, 0, 0.8) !important;
            backdrop-filter: blur(10px);
        }
        .navbar-brand {
            font-weight: bold;
            color: #ffc107 !important;
            font-size: 1.5rem;
        }
        .nav-link {
            color: #e0e0e0 !important;
            font-weight: 500;
            transition: color 0.3s;
        }
        .nav-link:hover {
            color: #ffc107 !important;
        }
        .hero-slider {
            height: 100vh;
            width: 100%;
            position: relative;
            overflow: hidden;
        }
        .carousel-item {
            height: 100vh;
            background-position: center;
            background-size: cover;
        }
        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .hero-content {
            text-align: center;
            z-index: 2;
        }
        .hero-title {
            font-size: 4rem;
            font-weight: bold;
            text-transform: uppercase;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            margin-bottom: 20px;
        }
        .hero-subtitle {
            font-size: 1.5rem;
            margin-bottom: 30px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        .btn-custom {
            background-color: #ffc107;
            color: #000;
            padding: 10px 30px;
            font-weight: bold;
            border-radius: 30px;
            text-transform: uppercase;
            transition: all 0.3s;
            border: none;
        }
        .btn-custom:hover {
            background-color: #e0a800;
            transform: translateY(-2px);
        }
        .news-section {
            padding: 50px 0;
            background-color: #1e1e1e;
        }
        .news-card {
            background-color: #2c2c2c;
            border: none;
            border-radius: 10px;
            overflow: hidden;
            transition: transform 0.3s;
            margin-bottom: 20px;
        }
        .news-card:hover {
            transform: translateY(-5px);
        }
        .news-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        .news-card-body {
            padding: 20px;
        }
        .news-date {
            color: #aaa;
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        .news-title {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 10px;
            color: #ffc107;
        }
        .news-excerpt {
            color: #ddd;
        }
        footer {
            background-color: #000;
            padding: 30px 0;
            text-align: center;
            color: #777;
        }
    </style>
</head>
<body>

    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg fixed-top">
        <div class="container">
            <a class="navbar-brand" href="index.php"><i data-lucide="sword"></i> Myth War</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="index.php">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="#news">News</a></li>
                    <li class="nav-item"><a class="nav-link" href="#download">Download</a></li>
                    <?php if (isLoggedIn()): ?>
                        <li class="nav-item"><a class="nav-link" href="profile.php">Profile</a></li>
                        <li class="nav-item"><a class="nav-link" href="logout.php">Logout</a></li>
                    <?php else: ?>
                        <li class="nav-item"><a class="nav-link" href="login.php">Login</a></li>
                        <li class="nav-item"><a class="nav-link" href="register.php">Register</a></li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Full Screen Slider -->
    <div id="heroCarousel" class="carousel slide hero-slider" data-bs-ride="carousel">
        <div class="carousel-inner">
            <div class="carousel-item active" style="background-image: url('https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');">
                <div class="overlay">
                    <div class="hero-content">
                        <h1 class="hero-title">Welcome to Myth War</h1>
                        <p class="hero-subtitle">Experience the ultimate fantasy MMORPG adventure.</p>
                        <a href="register.php" class="btn btn-custom btn-lg">Play Now</a>
                    </div>
                </div>
            </div>
            <div class="carousel-item" style="background-image: url('https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');">
                <div class="overlay">
                    <div class="hero-content">
                        <h1 class="hero-title">Epic Battles</h1>
                        <p class="hero-subtitle">Join thousands of players in epic guild wars.</p>
                        <a href="register.php" class="btn btn-custom btn-lg">Join the Fight</a>
                    </div>
                </div>
            </div>
            <div class="carousel-item" style="background-image: url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');">
                <div class="overlay">
                    <div class="hero-content">
                        <h1 class="hero-title">New Expansion</h1>
                        <p class="hero-subtitle">Discover new lands and conquer new dungeons.</p>
                        <a href="#news" class="btn btn-custom btn-lg">Read More</a>
                    </div>
                </div>
            </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
        </button>
    </div>

    <!-- News Section -->
    <section id="news" class="news-section">
        <div class="container">
            <h2 class="text-center mb-5" style="color: #ffc107;">Latest News</h2>
            <div class="row">
                <div class="col-md-4">
                    <div class="news-card">
                        <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="News 1">
                        <div class="news-card-body">
                            <div class="news-date"><i data-lucide="calendar" size="14"></i> Oct 25, 2023</div>
                            <h5 class="news-title">Server Maintenance</h5>
                            <p class="news-excerpt">Scheduled maintenance will take place on Oct 28th for system upgrades.</p>
                            <a href="#" class="text-warning text-decoration-none">Read More &rarr;</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="news-card">
                        <img src="https://images.unsplash.com/photo-1580234550905-96d3fba433e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="News 2">
                        <div class="news-card-body">
                            <div class="news-date"><i data-lucide="calendar" size="14"></i> Oct 20, 2023</div>
                            <h5 class="news-title">Double XP Weekend</h5>
                            <p class="news-excerpt">Get ready to level up faster! Double XP starts this Friday.</p>
                            <a href="#" class="text-warning text-decoration-none">Read More &rarr;</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="news-card">
                        <img src="https://images.unsplash.com/photo-1560419015-7c427e87152b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="News 3">
                        <div class="news-card-body">
                            <div class="news-date"><i data-lucide="calendar" size="14"></i> Oct 15, 2023</div>
                            <h5 class="news-title">New Event: Demon Square</h5>
                            <p class="news-excerpt">Face the hordes of demons in the new Demon Square event.</p>
                            <a href="#" class="text-warning text-decoration-none">Read More &rarr;</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Download Section -->
    <section id="download" class="py-5" style="background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80'); background-size: cover; background-attachment: fixed;">
        <div class="container text-center">
            <h2 class="text-white mb-4 display-4 fw-bold">Ready to Join the Fight?</h2>
            <p class="lead text-white-50 mb-5">Download the client now and start your adventure in the world of Myth War.</p>
            <div class="row justify-content-center gap-3">
                <div class="col-auto">
                    <a href="#" class="btn btn-custom btn-lg px-5 py-3">
                        <i data-lucide="download" class="me-2"></i> Download Client (Installer)
                    </a>
                </div>
                <div class="col-auto">
                    <a href="#" class="btn btn-outline-light btn-lg px-5 py-3">
                        <i data-lucide="file-archive" class="me-2"></i> Portable Zip
                    </a>
                </div>
            </div>
            <div class="mt-4 text-white-50">
                <small>Version 1.0.0 | Size: 1.2 GB | System Requirements: Windows 10/11</small>
            </div>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>&copy; 2023 Myth War Online. All rights reserved.</p>
            <p><small>This is a fan project. All trademarks belong to their respective owners.</small></p>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        lucide.createIcons();
    </script>
</body>
</html>

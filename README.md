# Task Manager – Vistula Team Project

A simple browser-based Task Manager built with HTML, CSS, JavaScript and Supabase (PostgreSQL REST API).

## Student information

- Student name: Oleksandr Steshenko
- Vistula Student ID: 67674
- GitHub: https://github.com/vistula-team-project-67674

## Links

- Repository: https://github.com/vistula-team-project-67674/vistula-task-manager
- GitHub Pages: https://vistula-team-project-67674.github.io/vistula-task-manager/

## Features

- Read tasks from Supabase
- Add tasks
- Edit task title and description
- Mark tasks complete or incomplete
- Delete tasks
- Persist tasks in the Supabase database

## Technologies

- HTML5, CSS3 and vanilla JavaScript
- Supabase PostgreSQL and automatically generated REST API
- GitHub Pages

## Configuration

The public Supabase project URL and publishable key are stored in `config.json`. A publishable key is intended for browser use; never put a Supabase secret or service-role key in this repository.

The `tasks` table has these columns:

- `id` – BIGINT identity primary key
- `title` – TEXT, required
- `description` – TEXT, optional
- `completed` – BOOLEAN, default false

The demonstration table uses public RLS policies for this introductory assignment. It must contain test data only.

## Deployment

GitHub repository → Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.

After deployment, open the GitHub Pages link above.

## Team collaboration

The following links must be filled in after the two Pull Requests have been merged:

- Outgoing Pull Request (this student contributed to a partner repository): TODO
- Incoming Pull Request (partner contributed to this repository): TODO

The partner must add `contribution.html` and `contribution.json` through an incoming Pull Request. Do not create those two files directly in this repository.

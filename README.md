# Drillbook

Hands-on undergraduate labs for three sessions:

1. **Git** — commits, branches, a merge conflict, and a remote that is a folder on the same machine.
2. **Docker** — run a container, build an image, see what a volume keeps, and start two services with Compose.
3. **AWS EC2 and S3** — prove which account the CLI will change, launch one instance, store a private object behind a link that expires, and delete all of it.

The site is the exercise sheet. Students work in new folders in their home directory (`~/drillbook-git`, `~/drillbook-docker`, `~/drillbook-aws`), not in this repository. Checks they tick are stored in the browser only.

`student-labs/` holds reference copies of the Docker and AWS files the drills ask students to create.

## Run the sheet

Docker Compose serves the exercise sheet. You need Docker Engine (or Docker Desktop) with the Compose plugin.

```bash
docker compose up --build
```

Open [http://127.0.0.1:8431](http://127.0.0.1:8431). The first build downloads the Node image and compiles the site. Later starts reuse that image.

Stop it with Ctrl+C, then:

```bash
docker compose down
```

The Git, Docker, and AWS drills still happen on the student's machine, in `~/drillbook-git`, `~/drillbook-docker`, and `~/drillbook-aws`. `student-labs/` is the reference copy of the files those drills ask them to write. The Compose file in this folder only runs the sheet.

To edit the site on the host instead:

```bash
npm install
npm run dev
```

That uses the same address, [http://127.0.0.1:8431](http://127.0.0.1:8431).

## Before a session

The Prep page lists the three version checks: Git 2.23 or newer (`git switch` exists), a Docker daemon that answers `docker version`, and AWS CLI v2 on the day you reach EC2 and S3.

AWS drills create real resources. Use a sandbox, an AWS Academy Learner Lab, or a personal account with a budget alert. Do not point students at an account that holds anything else and then give them broad EC2 and S3 access. The last AWS drill terminates the instance and deletes the bucket. That drill is the assignment.

Free tier and credit terms change. A `t3.micro` left running is the usual surprise. The sheet tells students to stop the instance at the end of the EC2 drill and to terminate it before they leave.

## What to collect

Each drill has a “Show the instructor” line. Collect that command output. Do not collect `.pem` files, access keys, or presigned URLs that are still valid.

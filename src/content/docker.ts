import {
  cafeIndexHtml,
  composeYaml,
  menuApiApp,
  menuApiDockerfile,
  menuApiDockerignore,
} from "./files";
import { cmd, expected, file, note, p, ul, warn, type Drill } from "./types";

export const dockerDrills: Drill[] = [
  {
    module: "docker",
    slug: "first-container",
    number: 1,
    title: "Run a container you did not build",
    minutes: 25,
    outcome:
      "You can start a container, reach it from your machine, read its logs, and remove it without removing the image.",
    handIn: "The 200 from curl, then docker ps showing that drillbook-web is gone.",
    steps: [
      {
        id: "docker-first-1",
        title: "Check that the daemon answers",
        blocks: [
          p("Install Docker Desktop or Docker Engine before this session if docker is not a command. The prep page has the link."),
          cmd(`docker version`),
          expected(`A Client section and a Server section.
The Server section includes a Version line.`),
          warn("If you only see the client, and the server section says it cannot connect, the Docker daemon is not running. Start Docker Desktop, or start the engine, and run docker version again. Do not chmod the Docker socket to world-writable to get past this."),
        ],
      },
      {
        id: "docker-first-2",
        title: "Run a container that exits, and throw the container away",
        blocks: [
          cmd(`docker pull hello-world
docker run --rm hello-world`),
          expected(`Hello from Docker!`),
          p("An image is the packed filesystem and the start command. A container is a running or exited instance of an image. --rm deletes the container when it exits. The hello-world image is still on disk, which you can see with docker images hello-world."),
        ],
      },
      {
        id: "docker-first-3",
        title: "Publish a port and curl nginx",
        blocks: [
          p("nginx inside the container listens on port 80. Your machine will listen on port 8088 and forward to it. The order is host port, then container port."),
          cmd(`docker run -d --name drillbook-web -p 8088:80 nginx:alpine
docker ps
curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:8088/`),
          expected(`docker ps lists drillbook-web.
The PORTS column contains 0.0.0.0:8088->80/tcp, or 127.0.0.1:8088->80/tcp.
curl prints 200.`),
          ul([
            "-d runs it in the background and prints the container id.",
            "--name gives you a name so you do not have to copy the id.",
            "-p 8088:80 publishes container port 80 on your port 8088.",
          ]),
          note("If curl cannot connect and the error mentions the address already in use, port 8088 is taken. Remove this container and repeat with -p 8090:80, then curl port 8090. Write down the port you actually used."),
        ],
      },
      {
        id: "docker-first-4",
        title: "Read the logs and run a command inside the container",
        blocks: [
          cmd(`docker logs drillbook-web
docker exec drillbook-web ls /usr/share/nginx/html`),
          expected(`The logs include a GET / from the curl you just ran.
ls prints index.html, the default page nginx ships with.`),
          p("docker exec starts a second process in the same container. You did not open a shell you have to remember to exit. The container's main process is still nginx."),
        ],
      },
      {
        id: "docker-first-5",
        title: "Stop and remove the container, and notice the image is still there",
        blocks: [
          cmd(`docker stop drillbook-web
docker rm drillbook-web
docker ps -a --filter name=drillbook-web
docker images nginx`),
          expected(`docker ps -a prints no container named drillbook-web.
docker images nginx still lists nginx, with the alpine tag.`),
          p("Stopping a container stops its process. Removing it deletes that instance. The image stays, so the next run does not download nginx again. Leaving the container around is how a later drill ends up with \"name already in use\"."),
        ],
      },
    ],
    questions: [
      {
        q: "You stopped and removed the container. Is the nginx image gone?",
        a: "No. The image is the template. The container was one run of that template. docker images nginx still lists it.",
      },
      {
        q: "Why is the port map 8088:80 and not 80:8088?",
        a: "The left side is the port on your machine. The right side is the port the process listens on inside the container. nginx is listening on 80 in there. You chose 8088 so you do not need to bind to port 80 on the host, which often requires extra privileges.",
      },
      {
        q: "What did --rm change on the hello-world run?",
        a: "It deleted the container when the process exited. It did not delete the image.",
      },
    ],
    mistakes: [
      "Curling port 80 because that is the port you remember from the image. Curl the host port, the left side of -p.",
      "A daemon that is not running. docker version must show a Server section before the rest of the session is worth starting.",
      "Opening the Docker socket to every user on the machine. If you cannot run docker, ask for access to the daemon. Do not chmod 777 /var/run/docker.sock.",
    ],
    checkpoint:
      "You saw curl print 200, and docker ps -a --filter name=drillbook-web no longer lists that container.",
  },
  {
    module: "docker",
    slug: "dockerfile",
    number: 2,
    title: "Build an image from a Dockerfile",
    minutes: 40,
    outcome:
      "You can build an image for a small Python service, publish its port, and replace a running container after a code change.",
    handIn: "curl of /menu showing North Gate Cafe and three items, then again after the price change.",
    steps: [
      {
        id: "docker-dockerfile-1",
        title: "Create the menu API",
        blocks: [
          p("This service answers two URLs, /health and /menu. It uses only the Python standard library, so the image does not need a package install. The cafe name comes from the environment, which means two containers from the same image can introduce themselves differently."),
          p("Save the file as ~/drillbook-docker/menu-api/app.py. The same file is in this repository at student-labs/docker/menu-api/app.py if you cloned it. Read it once before you build. The listen address is 0.0.0.0 on purpose: inside a container, 127.0.0.1 would accept connections only from inside that container, and the published port would sit there unused."),
          cmd(`mkdir -p "$HOME/drillbook-docker/menu-api"
cd "$HOME/drillbook-docker/menu-api"`),
          file("menu-api/app.py", menuApiApp),
        ],
      },
      {
        id: "docker-dockerfile-2",
        title: "Write the Dockerfile and ignore a few files",
        blocks: [
          p("Put the Dockerfile next to app.py. EXPOSE writes down which port the process listens on. It does not publish that port. Publishing is the -p flag at run time. The JSON form of CMD runs Python without a shell in the middle."),
          file("menu-api/Dockerfile", menuApiDockerfile),
          file("menu-api/.dockerignore", menuApiDockerignore),
          note(".dockerignore keeps the build from sending .git, .env, and logs to the Docker daemon. The image should contain the application, not your local clutter. There is no .env in this folder yet. The rule is there before the file exists, which is the same habit as the Git drill."),
        ],
      },
      {
        id: "docker-dockerfile-3",
        title: "Build the image and prove EXPOSE did not publish anything",
        blocks: [
          cmd(`docker build -t menu-api:lab .
docker image history menu-api:lab
docker run -d --name menu-api-closed menu-api:lab
curl -sS --connect-timeout 3 http://127.0.0.1:8000/menu || echo "no connection"
docker rm -f menu-api-closed`),
          expected(`The build finishes and names the image menu-api:lab.
docker image history shows a row whose CREATED BY mentions COPY app.py . and rows that come from the Python base image. The ids will not match a classmate's.
curl fails, and the shell prints "no connection".`),
          p("The container was running. Your machine had no route to it, because you did not publish a port. The second build of this image, after a code change, should be quicker and should not download Python again. Docker reuses the base layers."),
        ],
      },
      {
        id: "docker-dockerfile-4",
        title: "Publish the port and read the menu",
        blocks: [
          cmd(`docker run -d --name menu-api -p 8000:8000 -e CAFE_NAME="North Gate Cafe" menu-api:lab
curl -s http://127.0.0.1:8000/health
curl -s http://127.0.0.1:8000/menu
docker logs menu-api`),
          expected(`{"ok": true, "cafe": "North Gate Cafe"}

The menu JSON includes "cafe": "North Gate Cafe" and three items: Espresso at 2.5, Cardamom latte at 4.5, Knafeh at 5.5. One line of JSON is fine.

docker logs includes "listening on 8000" and the GET lines from curl.`),
        ],
      },
      {
        id: "docker-dockerfile-5",
        title: "Change the price and notice the running container does not change",
        blocks: [
          p("In app.py, change the espresso price from 2.5 to 3.0. Save the file. Rebuild, then curl the container that is already running before you replace it."),
          cmd(`docker build -t menu-api:lab .
curl -s http://127.0.0.1:8000/menu
docker rm -f menu-api
docker run -d --name menu-api -p 8000:8000 -e CAFE_NAME="North Gate Cafe" menu-api:lab
curl -s http://127.0.0.1:8000/menu
docker rm -f menu-api
docker images menu-api`),
          expected(`The curl before docker rm still shows espresso at 2.5.
The curl after the new container starts shows espresso at 3.0.
docker images menu-api still lists menu-api:lab after the container is gone.`),
          p("Building an image does not edit a container that is already running. The tag menu-api:lab moved to the new image. The old container kept running the old filesystem until you removed it. Leave the container removed so port 8000 is free for the Compose drill. The image stays."),
        ],
      },
    ],
    questions: [
      {
        q: "What is the difference between the image menu-api:lab and the container named menu-api?",
        a: "menu-api:lab is the image tag, a name for a built snapshot. menu-api is the name of one container created from it. You can remove the container and still have the image. You can run a second container from the same image with a different name and a different CAFE_NAME.",
      },
      {
        q: "Why did the first curl after the rebuild still show 2.5?",
        a: "That process was still the old container, started before the rebuild. The new image was only used when you ran docker run again.",
      },
      {
        q: "What does EXPOSE actually do?",
        a: "It documents the port in the image metadata. It does not publish the port on your machine. The closed container was the demonstration: the process was running, and curl could not reach it until -p.",
      },
    ],
    mistakes: [
      "Building from the wrong directory, so Docker cannot find the Dockerfile or app.py. pwd should be ~/drillbook-docker/menu-api for the build in this drill.",
      "Forgetting -p and concluding the application is broken. Check docker ps for a port mapping first.",
      "Editing app.py on the host and expecting the running container to notice. Nothing is mounted into the container in this drill. A rebuild and a new container are how this image gets updated. Volumes are the next drill.",
    ],
    checkpoint:
      "The second menu curl showed espresso at 3.0, the container named menu-api is gone, and docker images still lists menu-api:lab.",
  },
  {
    module: "docker",
    slug: "volumes",
    number: 3,
    title: "Writes inside a container disappear",
    minutes: 30,
    outcome:
      "You can predict what survives a container replacement, and you can mount a volume or a host folder when you want a file to survive.",
    handIn: "The cat that still prints \"shift two\" after the container was removed, and the host file that contains both lines.",
    steps: [
      {
        id: "docker-volumes-1",
        title: "Write a file into a container, then throw the container away",
        blocks: [
          p("alpine is a small image with a shell and almost nothing else. sleep 1h keeps the container alive so you can docker exec into it. The file you write lives in that container's writable layer."),
          cmd(`docker rm -f scratch 2>/dev/null || true
docker run -d --name scratch -w /notes alpine sleep 1h
docker exec scratch sh -c 'echo "shift one" > /notes/log.txt'
docker exec scratch cat /notes/log.txt
docker rm -f scratch
docker run -d --name scratch -w /notes alpine sleep 1h
docker exec scratch cat /notes/log.txt || echo "the file is gone"`),
          expected(`The first cat prints "shift one".
The second cat fails, and the shell prints "the file is gone".`),
          p("docker rm deleted the writable layer with the container. A new container from the same image starts from the image, not from the files the previous container wrote."),
        ],
      },
      {
        id: "docker-volumes-2",
        title: "Put the file on a named volume",
        blocks: [
          p("A volume is storage Docker manages, separate from any one container. The mount -v drillbook-notes:/notes attaches that storage at /notes."),
          cmd(`docker rm -f scratch
docker volume create drillbook-notes
docker run -d --name scratch -w /notes -v drillbook-notes:/notes alpine sleep 1h
docker exec scratch sh -c 'echo "shift two" > /notes/log.txt'
docker rm -f scratch
docker run -d --name scratch -w /notes -v drillbook-notes:/notes alpine sleep 1h
docker exec scratch cat /notes/log.txt`),
          expected(`shift two`),
          p("The second container is new. The file is there because it was on the volume, and the volume was mounted again. The container was never the place the file lived."),
        ],
      },
      {
        id: "docker-volumes-3",
        title: "Bind-mount a normal folder from your machine",
        blocks: [
          p("A bind mount uses a path you can open in an editor. The same bytes are visible inside the container and on the host. This is the usual way to work on code without rebuilding for every change, and it is also how a container can be given access to more of your disk than you meant."),
          cmd(`mkdir -p "$HOME/drillbook-docker/notes"
docker rm -f scratch
docker run -d --name scratch -v "$HOME/drillbook-docker/notes:/notes" alpine sleep 1h
docker exec scratch sh -c 'echo "from the container" >> /notes/log.txt'
cat "$HOME/drillbook-docker/notes/log.txt"
printf '%s\\n' 'from the host' >> "$HOME/drillbook-docker/notes/log.txt"
docker exec scratch cat /notes/log.txt`),
          expected(`Both cats show:
from the container
from the host`),
        ],
      },
      {
        id: "docker-volumes-4",
        title: "Remove the container and the volume, and see what is left",
        blocks: [
          cmd(`docker rm -f scratch
docker volume rm drillbook-notes
ls "$HOME/drillbook-docker/notes/log.txt"`),
          expected(`The volume is removed.
ls still prints the path to log.txt in your home directory.`),
          p("The bind-mounted file was never on the volume. Deleting the volume did not delete it. Delete ~/drillbook-docker/notes yourself if you want the host file gone. That is an ordinary file delete, not a Docker command."),
          warn("Do not bind-mount / or your home directory into a container to \"make it easier\". The process inside would be able to read and write that tree. Mount the one folder the lab needs."),
        ],
      },
    ],
    questions: [
      {
        q: "Name the three places a file lived in this drill.",
        a: "The container's writable layer (shift one, deleted with the container), a named volume (shift two, deleted only when you removed the volume), and a folder on the host (the bind mount, still there after Docker cleanup).",
      },
      {
        q: "You docker rm a container that had no volume and no bind mount. Is a file you wrote inside it still there?",
        a: "No. That write was in the container's writable layer. Removing the container removes that layer.",
      },
      {
        q: "Why is a bind mount useful while you are editing code, and risky if the path is too wide?",
        a: "The process and your editor share one folder, so you can change a file without rebuilding. The same mechanism grants the container whatever the mounted path contains. A narrow path is the whole point.",
      },
    ],
    mistakes: [
      "Expecting docker volume rm to work while scratch is still running and mounted. Remove the container first.",
      "Looking for the volume file with ls in your project folder. A named volume is not a subdirectory of the place you ran the command. Docker stores it. The bind mount is the one with a normal path.",
      "Quoting the redirection inside docker exec without sh -c, so the host shell creates the file locally instead of in the container.",
    ],
    checkpoint:
      "After a new container mounted the same volume, cat printed shift two. After cleanup, the host file under ~/drillbook-docker/notes is still there, and docker volume ls does not list drillbook-notes.",
  },
  {
    module: "docker",
    slug: "compose",
    number: 4,
    title: "Two containers, one network",
    minutes: 40,
    outcome:
      "You can start the menu API and a static page with Compose, and you can call one service from the other by its service name.",
    handIn: "The wget output from inside the web container, and the failed wget to 127.0.0.1 that explains the localhost trap.",
    steps: [
      {
        id: "docker-compose-1",
        title: "Lay out the folder",
        blocks: [
          p("Compose starts from the directory that holds the compose file. You want this shape under your home directory:"),
          expected(`drillbook-docker/
  compose.yaml
  menu-api/
    app.py
    Dockerfile
    .dockerignore
  web/
    index.html`),
          p("If drill 2 is done, menu-api is already there. If espresso is still 3.0 from that drill, put it back to 2.5 so this drill matches the file below, or leave it. The price is not what this drill is about. The files are also in student-labs/docker."),
          cmd(`mkdir -p "$HOME/drillbook-docker/menu-api" "$HOME/drillbook-docker/web"
cd "$HOME/drillbook-docker"`),
          file("menu-api/app.py", menuApiApp),
          file("menu-api/Dockerfile", menuApiDockerfile),
          file("menu-api/.dockerignore", menuApiDockerignore),
          file("web/index.html", cafeIndexHtml),
          file("compose.yaml", composeYaml),
          note("depends_on waits until the api container has started. It does not wait until Python is listening. If a later command fails immediately with a connection error, wait two seconds and run it again."),
        ],
      },
      {
        id: "docker-compose-2",
        title: "Start both services",
        blocks: [
          cmd(`cd "$HOME/drillbook-docker"
docker compose up -d --build
docker compose ps`),
          expected(`Both services are running.
web publishes 8088 on the host.
api publishes 8000 on the host.`),
          p("If Docker says the port is allocated, a container from an earlier drill is still bound to it. docker ps shows the name. Stop and remove that container, or run docker compose down in this folder and start again."),
          cmd(`curl -s -o /dev/null -w 'web %{http_code}\\n' http://127.0.0.1:8088/
curl -s http://127.0.0.1:8000/menu`),
          expected(`web 200
The menu JSON names North Gate Cafe.`),
          p("Open http://127.0.0.1:8088/ in a browser as well. The page tells you it does not know the menu. That is honest: nginx is serving a file, and the API is a different container."),
        ],
      },
      {
        id: "docker-compose-3",
        title: "Call the API by its service name, then try localhost and watch it fail",
        blocks: [
          p("Compose puts both containers on one network. On that network the name api is the API container. The name web is the nginx container. localhost inside web is web itself, not your laptop, and not the API."),
          cmd(`docker compose exec web wget -q -O - http://api:8000/menu
docker compose exec web wget -q -O - http://127.0.0.1:8000/menu || echo "localhost inside web is not the API"`),
          expected(`The first wget prints the menu JSON.
The second wget fails. The error mentions a connection failure to 127.0.0.1, and the shell prints "localhost inside web is not the API".`),
          p("From your laptop, 127.0.0.1:8000 works because Compose published the port on the host. From inside web, nothing is listening on port 8000. The page you opened in the browser works for the same host-port reason. A link in that HTML is not evidence that the containers can use localhost to find each other."),
        ],
      },
      {
        id: "docker-compose-4",
        title: "Read the API logs, then shut the stack down",
        blocks: [
          cmd(`docker compose logs api
docker compose down
docker compose ps`),
          expected(`The api logs include the requests from curl and from wget.
After down, docker compose ps prints no running services. The header may remain. There should be no rows for api or web.`),
          p("docker compose down removes the containers and the network this file created. The images remain, including menu-api:lab and nginx. That is the same split you saw in the first drill. Do not prune images to \"clean up\" unless you want Docker to download them again next time."),
        ],
      },
    ],
    questions: [
      {
        q: "Why does the name api resolve inside the web container?",
        a: "Compose created a network for this project and registered each service name on it. web can connect to api:8000 the way a browser connects to a hostname. The hostname is the service name in the compose file, not the container's random id.",
      },
      {
        q: "Why doesn't 127.0.0.1:8000 inside web reach the API?",
        a: "127.0.0.1 always means \"this network namespace\". Inside web, that is the nginx container. The API is a different container. Publishing 8000 on your laptop does not make that port exist inside web.",
      },
      {
        q: "What did depends_on wait for?",
        a: "It waited for the api container to start. It did not wait for Python to accept connections. A health check would be the next step if the service needed that, and this lab does not add one.",
      },
    ],
    mistakes: [
      "Running docker-compose with the hyphen when only the Compose plugin is installed, or the reverse. This lab uses docker compose, the v2 plugin. docker compose version should print a version.",
      "Editing compose.yaml so the web container uses localhost to find the API. That is the mistake the drill is there to show.",
      "Leaving the stack up and then wondering why the next attempt cannot bind port 8000. docker compose down is part of the drill.",
    ],
    checkpoint:
      "From inside web, wget to http://api:8000/menu printed the menu, wget to http://127.0.0.1:8000/menu failed, and docker compose ps is empty after down.",
  },
];

## How to run

- Clone the repository by running `git clone https://github.com/alahirajeffrey/learnlyapp-backend-dev-assignment.git`

### With Docker

- Open a terminal and navigate to the project directory
- Create a `.env` file at the root of the project and populate using the `.env.example` file.
- Run the command `docker build -t learnlyapp-backend-dev-assignment .` to build the image.
- The command will build the Docker image with the tag nestjs-app using the current directory as the build context.
- Once the image is built, run the command `docker run --rm -p 3001:3001 learnlyapp-backend-dev-assignment`.
- This will start a container from the image and map port 3001 of the container to port 3001 on your local machine.
- Open your browser and navigate to `http://localhost:3001/api-doc` to open the swagger documentation

### Without Docker

- Open a terminal and navigate to the project directory.
- Create a `.env` file at the root of the project and populate using the `.env.example` file.
- Run `npm install` to install dependencies.
- Run `npm run build` to build the application.
- Run `npm run start:prod` to run the application.

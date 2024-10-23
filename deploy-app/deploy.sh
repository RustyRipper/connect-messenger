#!/bin/bash


EC2_BACKEND_HOST="18.213.116.207"
EC2_FRONTEND_HOST="98.81.107.48"
RDS_ENDPOINT="jdbc:mysql://connect-messenger-database.c3u7pg5zqr6k.us-east-1.rds.amazonaws.com:3306/connectmessenger"
CLIENT_ID=""
COGNITO_CLIENT_SECRET=""
COGNITO_ISSUER_URI="https://cognito-idp.us-east-1.amazonaws.com/us-east-1_8qizXo5rJ"

EC2_USER="ec2-user"
COGNITO_CLIENT_NAME="second-app-client"
CADDYFILE="Caddyfile"
SSH_KEY_PATH="connect.pem"
COMPOSE_BACKEND_FILE="compose-backend.yml"
DOMAIN_BACKEND="${EC2_BACKEND_HOST}.nip.io"
DOMAIN_FRONTEND="${EC2_FRONTEND_HOST}.nip.io"

sed -i "s|REACT_APP_URL:.*|REACT_APP_URL: $DOMAIN_FRONTEND|g" "compose-frontend.yml"
sed -i "s|API_URL:.*|API_URL: $DOMAIN_BACKEND|g" "compose-frontend.yml"
sed -i "s|APP_URL:.*|APP_URL: $DOMAIN_BACKEND|g" $COMPOSE_BACKEND_FILE
sed -i "s|FRONT_URL:.*|FRONT_URL: $DOMAIN_FRONTEND|g" $COMPOSE_BACKEND_FILE
sed -i "s|COGNITO_CLIENT_NAME:.*|COGNITO_CLIENT_NAME: $COGNITO_CLIENT_NAME|g" $COMPOSE_BACKEND_FILE
sed -i "s|SPRING_DATASOURCE_URL:.*|SPRING_DATASOURCE_URL: $RDS_ENDPOINT|g" $COMPOSE_BACKEND_FILE
sed -i "s|COGNITO_CLIENT_ID:.*|COGNITO_CLIENT_ID: $CLIENT_ID|g" $COMPOSE_BACKEND_FILE
sed -i "s|COGNITO_CLIENT_SECRET:.*|COGNITO_CLIENT_SECRET: $COGNITO_CLIENT_SECRET|g" $COMPOSE_BACKEND_FILE
sed -i "s|COGNITO_ISSUER_URI:.*|COGNITO_ISSUER_URI: $COGNITO_ISSUER_URI|g" $COMPOSE_BACKEND_FILE

echo "Generating Caddyfile with domain $DOMAIN_BACKEND"
cat <<EOF > Caddyfile
$DOMAIN_BACKEND {
    reverse_proxy localhost:8080
}
EOF

echo "Uploading $COMPOSE_BACKEND_FILE and $CADDYFILE to EC2 instance..."
scp -i "$SSH_KEY_PATH" "$COMPOSE_BACKEND_FILE" "$EC2_USER@$EC2_BACKEND_HOST:~/$COMPOSE_BACKEND_FILE"
scp -i "$SSH_KEY_PATH" "$CADDYFILE" "$EC2_USER@$EC2_BACKEND_HOST:~/$CADDYFILE"

ssh -i "$SSH_KEY_PATH" "$EC2_USER@$EC2_BACKEND_HOST" << EOF
  set -e
  sudo yum update -y
  sudo yum install docker -y
  sudo usermod -a -G docker ec2-user
  sudo systemctl start docker
  sudo chmod 666 /var/run/docker.sock

  echo "Pulling the latest Docker images specified in $COMPOSE_BACKEND_FILE..."
  DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
  sudo mkdir -p $DOCKER_CONFIG/cli-plugins
  sudo curl -SL https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
  sudo chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
  sudo cp $DOCKER_CONFIG/cli-plugins/docker-compose .

  sudo yum install -y yum-plugin-copr
  sudo yum copr enable -y @caddy/caddy epel-8-aarch64
  sudo yum install -y caddy


  ./docker-compose -f ~/$COMPOSE_BACKEND_FILE pull

  echo "Running Docker Compose services..."
  ./docker-compose -f ~/$COMPOSE_BACKEND_FILE up -d

  echo "Setting up Caddy server with $CADDYFILE..."
  sudo mv ~/$CADDYFILE /etc/caddy/Caddyfile
  sudo systemctl restart caddy

  echo "Deployment complete."
EOF

echo "Uploading frontend compose file to EC2 instance..."
scp -i "$SSH_KEY_PATH" "compose-frontend.yml" "$EC2_USER@$EC2_FRONTEND_HOST:~/compose-frontend.yml"

ssh -i "$SSH_KEY_PATH" "$EC2_USER@$EC2_FRONTEND_HOST" << EOF
  set -e
  sudo yum update -y
  sudo yum install docker -y
  sudo usermod -a -G docker ec2-user
  sudo systemctl start docker
  sudo chmod 666 /var/run/docker.sock

  echo "Pulling the latest Docker images specified in compose file"
  DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
  sudo mkdir -p $DOCKER_CONFIG/cli-plugins
  sudo curl -SL https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
  sudo chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
  sudo cp $DOCKER_CONFIG/cli-plugins/docker-compose .

  ./docker-compose -f ~/compose-frontend.yml pull

  echo "Running Docker Compose services..."
  ./docker-compose -f ~/compose-frontend.yml up -d

  echo "Deployment complete."
EOF
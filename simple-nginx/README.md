# Tutorial how to install simple Nginx webserver

This will install LAMP stack PHP, MySQL, and Apache 

## Initial Installation
```
sudo yum update -y
sudo yum install -y httpd24 php72 mysql57-server php72-mysqlnd
# Either this
sudo yum install -y nginx
sudo vi /etc/nginx/nginx.conf
# Or this in Amazon Linux 2
sudo amazon-linux-extras install -y nginx1
nginx -v
```

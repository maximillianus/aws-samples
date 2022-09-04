#!/bin/bash

# Install CFN helper script
apt-get update -y
mkdir -p /opt/aws/bin
wget https://s3.amazonaws.com/cloudformation-examples/aws-cfn-bootstrap-py3-latest.tar.gz
python3 -m easy_install --script-dir /opt/aws/bin aws-cfn-bootstrap-py3-latest.tar.gz


# Install Wordpress
apt-get update -y && apt-get upgrade -y
apt-get install apache2 php php-dev php-mysql -y

wget https://wordpress.org/latest.tar.gz
tar -xvzf latest.tar.gz
cp -r wordpress/* /var/www/html

# rm -rf wordpress latest.tar.gz
rm -rf /var/www/html/index.html

chown -R www-data:www-data /var/www/html
service apache2 start

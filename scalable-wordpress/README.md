# How to create Scalable Wordpress Architecture

## Steps

### Single Server Wordpress
- Install LAMP stack with MariaDB or MySQL DB
  - `sudo amazon-linux-extras install -y lamp-mariadb10.2-php7.2 php7.2`
  - `sudo yum install -y httpd mariadb-server`
- Download and install latest wordpress (https://wordpress.org/latest.zip)
- Install Wordpress and serve from `/var/www/html`
- Add user to apache group: `sudo usermod -a -G apache ec2-user`
- Change group ownership: `sudo chown -R ec2-user:apache /var/www`
- Add group write permission for future subdirs: `sudo chmod 2775 /var/www && find /var/www -type d -exec sudo chmod 2775 {} \;`
- Add group write permission recursively: `find /var/www -type f -exec sudo chmod 0664 {} \;`
- Note: **Change the above directory/user/group as per necessary**

### Separate App + DB Server Wordpress
- Follow above installation
- Specify DB credentials in `wp-config.php`

### Scalable Wordpress
- Note on Wordpress structure:
  - Core wordpress files are in `wp-admin` and `wp-includes` directory.
  - Plugins/Themes/Uploads will be located in `wp-content` directory
  - Control of Wordpress can be done using WP-CLI (https://make.wordpress.org/cli/handbook/guides/installing/)
  - Database contains the main posts/pages/comments and settings of Wordpress
- Scalability can be done by either:
  1. putting all WP installation dir into shared storage
  2. putting `wp-content` dir into shared storage
  3. putting `uploads` dir into shared storage (untested)
- Best method is to put `wp-content` into shared storage.
  - Mount EFS or Shared Storage into `/var/www/html/wp-content`
  - Wrap everything else as AMI image and put into Autoscaling Group
- Activate Opcache to speed up file delivery even further
  - Install opcache `sudo yum install php-opcache`
  - Enable Opcache (follow guidance on opcache.ini setting)
  - Ensure Opcache available in phpinfo by restarting nginx/httpd/apache2 (`sudo systemctl restart httpd`) or php-fpm (`sudo systemctl restart php-fpm`)
  - Response time will improve


## References
- Wordpress File Structure: https://codex.wordpress.org/WordPress_Files
- Wordpress DB Structure: https://codex.wordpress.org/Database_Description
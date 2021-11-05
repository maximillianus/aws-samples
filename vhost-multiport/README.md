# Virtual Host Multiport

This is the `httpd.conf` setting to have website hosted in multiple port in 1 instance. Web can be accessed using IP address

## Security Groups
- open corresponding ports to access the website

## AWS Application Load Balancer
- Setup Listener on corresponding ports
- Open up ports on security groups
- Set Target Group's Target Registration's port as well
FROM php:7.2-apache

# Copy application files
COPY src/ /var/www/html/

# Copy custom configuration
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

# Set ServerName globally in Apache configuration
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Set appropriate permissions
RUN chmod -R 755 /var/www/html

EXPOSE 80

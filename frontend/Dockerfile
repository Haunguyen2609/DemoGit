FROM nginx:alpine

# Copy frontend files vào nginx html root
COPY . /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

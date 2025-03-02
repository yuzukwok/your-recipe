# 构建阶段
FROM node:18 as build

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

# 生产阶段
FROM nginx:alpine

COPY --from=build /app/dist/your-recipe /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 
// src/services/api.js - خدمة API للتواصل مع الخلفية
import axios from 'axios';
import { getToken, removeToken } from './auth';

// إنشاء نسخة من Axios مع الإعدادات الافتراضية
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// إضافة معترض طلبات لإضافة رمز الوصول إلى الرأس
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// إضافة معترض استجابة للتعامل مع أخطاء المصادقة
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // تسجيل الخروج عند انتهاء صلاحية الرمز
            removeToken();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// src/services/auth.js - خدمة المصادقة
export const TOKEN_KEY = '@code-analyzer:token';
export const USER_KEY = '@code-analyzer:user';

// حفظ رمز الوصول والمستخدم في التخزين المحلي
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const setUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// الحصول على رمز الوصول والمستخدم من التخزين المحلي
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    if (user) {
        return JSON.parse(user);
    }
    return null;
};

// إزالة رمز الوصول والمستخدم من التخزين المحلي
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const removeUser = () => {
    localStorage.removeItem(USER_KEY);
};

// التحقق من حالة المصادقة
export const isAuthenticated = () => {
    return getToken() !== null;
};

// تسجيل الدخول
export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
};

// تسجيل مستخدم جديد
export const register = async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
};

// تسجيل الخروج
export const logout = () => {
    removeToken();
    removeUser();
};

// src/components/Loader.js - مكون التحميل
import React from 'react';

const Loader = ({ message = 'جاري التحميل...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">{message}</p>
        </div>
    );
};

export default Loader;

// src/components/EmptyState.js - مكون الحالة الفارغة
import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon, title, message, actionLink, actionText }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6 text-center">{message}</p>
            {actionLink && actionText && (
                <Link
                    to={actionLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    {actionText}
                </Link>
            )}
        </div>
    );
};

export default EmptyState;

// src/components/PrivateRoute.js - مكون توجيه المستخدمين المصادقين
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

const PrivateRoute = () => {
    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;

// .env - ملف متغيرات البيئة
/*
REACT_APP_API_URL=http://localhost:5000/api
*/

// .env.production - ملف متغيرات البيئة للإنتاج
/*
REACT_APP_API_URL=https://code-analyzer-api.example.com/api
*/

// server/.env - ملف متغيرات البيئة للخادم
/*
PORT=5000
MONGODB_URI=mongodb://localhost:27017/code-analyzer
JWT_SECRET=your_jwt_secret_key_here
REDIS_HOST=localhost
REDIS_PORT=6379
GITHUB_TOKEN=your_github_personal_access_token
*/

// server/Dockerfile - ملف Docker للخادم
/*
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
*/

// client/Dockerfile - ملف Docker للعميل
/*
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
*/

// docker-compose.yml - ملف Docker Compose
/*
version: '3'

services:
  api:
    build: ./server
    container_name: code-analyzer-api
    restart: unless-stopped
    environment:
      - PORT=5000
      - MONGODB_URI=mongodb://mongo:27017/code-analyzer
      - JWT_SECRET=your_jwt_secret_key_here
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - GITHUB_TOKEN=your_github_personal_access_token
    ports:
      - "5000:5000"
    depends_on:
      - mongo
      - redis
    networks:
      - app-network

  client:
    build: ./client
    container_name: code-analyzer-client
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - app-network

  mongo:
    image: mongo:latest
    container_name: mongo
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

  redis:
    image: redis:alpine
    container_name: redis
    restart: unless-stopped
    volumes:
      - redis-data:/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongo-data:
  redis-data:
*/
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Serve your site
app.use(express.static(path.join(__dirname, 'public')));

// Proxy (THIS IS THE MAGIC)
app.use('/proxy', createProxyMiddleware({
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/proxy': '',
    },
    router: (req) => {
        return req.query.url;
    },
    onProxyRes: function (proxyRes) {
        // Remove iframe protection
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
    }
}));

app.listen(3000, () => {
    console.log("🔥 Running on http://localhost:3000");
});

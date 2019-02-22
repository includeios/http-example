### node 创建http2服务

- 控制台**npm install**安装依赖
- 控制台**npm start**起服务

- 通过修改src文件夹下面的index.js部分开启http2/http服务

- Http2 服务访问https://localhost:3000 (虽然http2协议本身不要求https,但几大浏览器厂商都默认http2只支持https)

- Http 服务访问http://localhost:3000

  

#### http2

- bundle1和bundle2是服务器主动推送过来的静态资源

![image-20190221160849783](https://github.com/includeios/http-example/blob/master/static/image/1550739894919.jpg)

- 在请求很多个图片时，复用了一个tcp连接

![image-20190221161149225](https://github.com/includeios/http-example/blob/master/static/image/image-20190221161149225.png)

#### http

- bundle1和bundle2由document解析完服务器发起的请求

- 在请求很多个图片时，创建了多个Tcp请求
![image-20190221162021648](https://github.com/includeios/http-example/blob/master/static/image/image-20190221162021648.png)



#### Http2 Auto-Push

http2主动推送静态资源存在的问题：

- 有server端的工程师手动的添加每一个页面依赖的静态资源是十分困难和难以维护的。

- 浏览器本身会对静态资源做缓存处理。在http浏览器主动发起请求的环境下，浏览器发现有一张图片我可以直接使用缓存，会直接使用缓存而不是再发起一个请求图片的http。而在http2服务器端主动推送的环境下，服务器是一定会把这张图片通过http2推动给浏览器的，即使浏览器拥有这张图片的缓存。这样会造成网络的浪费。

解决的办法：[h2-auto-push](https://www.npmjs.com/package/h2-auto-push)

- google推出的一个解决这些问题的npm包，可以自动解析index页面依赖的静态资源，同时可以判断浏览器是否真正需要这份静态资源，在浏览器有缓存的情况下不会继续推送。详细可见[Rules of Thumb for HTTP/2 Push](https://docs.google.com/document/d/1K0NykTXBbbbTlv60t5MyJvXjqKGsCVNYHyLEXIxYMv0/edit)



#### 遗留问题

- http2发送几个tcp连接是不可设置的嘛？
  例子中http同时并发了6个tcp链接，http2只有一个，导致虽然http2多路复用，但速度还没有并发6个的http快

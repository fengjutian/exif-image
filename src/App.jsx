import { useState, useEffect, useRef } from 'react';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';
import './App.css';
import "@radix-ui/themes/styles.css";
import ImgList from './Img.jsx';


function App() {
  const [images, setImages] = useState([]);
  const viewerRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    if (images.length > 0 && galleryRef.current) {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
      viewerRef.current = new Viewer(galleryRef.current, {
        url(image) {
          return image.src;
        },
      });
    }
  }, [images]);


  useEffect(() => {
    // 定义真正的处理函数
    const handler = async (folderPaths) => {
      console.log('收到文件夹:', folderPaths);
      // setDir(folderPaths);   // 触发组件重渲染

      try {
        // const folderPath = folderPaths
        // const imagePaths = await window.electronAPI.getFolderImages(folderPath)
        // console.log('imagePaths111111:', imagePaths)
        // const imageURLs = imagePaths.map(p => `file://${p}`)
        // setImages(imageURLs)

        const imageURLs = [`file://${folderPaths}`];
        console.log('imageURLs:', imageURLs);

        setImages([...imageURLs]);
        console.log('更新后的 images:', images);
      } catch (error) {
        console.error('Error loading images:', error)
      }
    };

    // 注册监听
    window.electronAPI.onDirSelected(handler);

    // 清理函数：组件卸载时解绑，防止内存泄漏
    return () => {
      window.electronAPI.removeDirListener?.(handler); // 如果你 preload 里暴露了 remove
      // 如果 preload 没暴露 remove，也可以直接 ipcRenderer.removeListener
    };
  }, []);


  return (
    <div className="App">
      <div ref={galleryRef} className="gallery">
        {images && images.map((src, index) => (
          <img key={index} src={src} alt={`Image ${index}`} />
        ))}
      </div>

      <ImgList />
    </div>
  );
}

export default App;

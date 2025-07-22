import { useState, useEffect, useRef } from 'react';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';
import EXIF from 'exif-js';
import './App.css';
import "@radix-ui/themes/styles.css";


function App() {
  const [images, setImages] = useState([]);
  // const [exifData, setExifData] = useState({});
  const viewerRef = useRef(null);
  const galleryRef = useRef(null);
  const [dir, setDir] = useState('');

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


  // const handleOpenFolder = async () => {
  //   try {
  //     const folderPaths = await window.electronAPI.openFolderDialog()
  //     if (!folderPaths || folderPaths.length === 0) return
  //     const folderPath = folderPaths[0] // 取第一个选中的文件夹
  //     const imagePaths = await window.electronAPI.getFolderImages(folderPath)
  //     const imageURLs = imagePaths.map(p => `file://${p}`)
  //     setImages(imageURLs)
  //   } catch (error) {
  //     console.error('Error loading images:', error)
  //   }
  // }


  useEffect(() => {
    // 定义真正的处理函数
    const handler = async (folderPaths) => {
      console.log('收到文件夹:', folderPaths);
      setDir(folderPaths);   // 触发组件重渲染

      try {
        // const folderPaths = await window.electronAPI.openFolderDialog()
        if (!folderPaths || folderPaths.length === 0) return

        console.log('选择的文件夹路径:', folderPaths);

        const folderPath = folderPaths // 取第一个选中的文件夹
        const imagePaths = await window.electronAPI.getFolderImages(folderPath)
        console.log('imagePaths111111:', imagePaths)
        const imageURLs = imagePaths.map(p => `file://${p}`)
        setImages(imageURLs)
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

  // const readExifData = (imageFiles) => {
  //   const allExifData = {};
  //   imageFiles.forEach(imageSrc => {
  //     const img = new Image();
  //     img.src = imageSrc;
  //     img.onload = () => {
  //       EXIF.getData(img, function() {
  //         const data = EXIF.getAllTags(this);
  //         allExifData[imageSrc] = data;
  //         setExifData({ ...allExifData });
  //       });
  //     };
  //   });
  // };

  return (
    <div className="App">
      {/* <button onClick={handleOpenFolder}>选择文件夹</button> */}
      <div ref={galleryRef} className="gallery">
        {images && images.map((src, index) => (
          <img key={index} src={src} alt={`Image ${index}`} />
        ))}
      </div>

      <div>
        <h3>当前目录：</h3>
        <p>{dir || '未选择'}</p>
      </div>
    </div>
  );
}

export default App;

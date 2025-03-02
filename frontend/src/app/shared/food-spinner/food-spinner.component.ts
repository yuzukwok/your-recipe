import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy, ViewChild, Input } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-food-spinner',
  template: `
    <div #rendererContainer class="w-full h-full min-h-[200px]"></div>
  `,
  styles: []
})
export class FoodSpinnerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() foodType: 'pizza' | 'apple' | 'cake' = 'cake';
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private food!: THREE.Mesh;
  private animationFrameId: number | null = null;
  
  constructor() { }

  ngOnInit(): void {
  }
  
  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
    
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    if (this.food) {
      this.scene.remove(this.food);
      (this.food.geometry as THREE.BufferGeometry).dispose();
      (this.food.material as THREE.Material).dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
  
  private initThree(): void {
    // 创建场景
    this.scene = new THREE.Scene();
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
    
    // 创建相机
    const container = this.rendererContainer.nativeElement;
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = 5;
    
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x000000, 0); // 透明背景
    container.appendChild(this.renderer.domElement);
    
    // 创建食物对象
    this.createFood();
  }
  
  private createFood(): void {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    
    switch (this.foodType) {
      case 'pizza':
        // 创建一个圆柱体作为披萨
        geometry = new THREE.CylinderGeometry(2, 2, 0.2, 32);
        material = new THREE.MeshStandardMaterial({ 
          color: 0xF5DEB3,
          roughness: 0.7,
          metalness: 0.1
        });
        break;
        
      case 'apple':
        // 创建一个球体作为苹果
        geometry = new THREE.SphereGeometry(1.5, 32, 32);
        material = new THREE.MeshStandardMaterial({ 
          color: 0xFF0000,
          roughness: 0.3,
          metalness: 0.1
        });
        break;
        
      case 'cake':
      default:
        // 创建一个圆柱体作为蛋糕
        geometry = new THREE.CylinderGeometry(1.5, 1.5, 1, 32);
        material = new THREE.MeshStandardMaterial({ 
          color: 0xFFC0CB,
          roughness: 0.5,
          metalness: 0.1
        });
        break;
    }
    
    this.food = new THREE.Mesh(geometry, material);
    this.scene.add(this.food);
    
    // 根据食物类型添加装饰
    this.addFoodDecorations();
  }
  
  private addFoodDecorations(): void {
    switch (this.foodType) {
      case 'pizza':
        // 添加披萨上的配料
        for (let i = 0; i < 10; i++) {
          const toppingGeometry = new THREE.SphereGeometry(0.2, 16, 16);
          const toppingMaterial = new THREE.MeshStandardMaterial({ 
            color: Math.random() > 0.5 ? 0x8B0000 : 0x006400
          });
          const topping = new THREE.Mesh(toppingGeometry, toppingMaterial);
          
          // 随机位置
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 1.5;
          topping.position.x = Math.cos(angle) * radius;
          topping.position.y = 0.2;
          topping.position.z = Math.sin(angle) * radius;
          
          this.food.add(topping);
        }
        break;
        
      case 'apple':
        // 添加苹果梗
        const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 1.5;
        stem.rotation.x = Math.PI / 12;
        this.food.add(stem);
        
        // 添加叶子
        const leafGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.3);
        const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x008000 });
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.set(0.3, 1.5, 0);
        leaf.rotation.z = Math.PI / 6;
        this.food.add(leaf);
        break;
        
      case 'cake':
      default:
        // 添加蛋糕上的装饰
        // 奶油顶层
        const creamGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32);
        const creamMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xFFFFFF,
          roughness: 0.2
        });
        const cream = new THREE.Mesh(creamGeometry, creamMaterial);
        cream.position.y = 0.65;
        this.food.add(cream);
        
        // 添加草莓
        for (let i = 0; i < 5; i++) {
          const berryGeometry = new THREE.SphereGeometry(0.25, 16, 16);
          const berryMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
          const berry = new THREE.Mesh(berryGeometry, berryMaterial);
          
          const angle = (i / 5) * Math.PI * 2;
          const radius = 1;
          berry.position.x = Math.cos(angle) * radius;
          berry.position.y = 0.85;
          berry.position.z = Math.sin(angle) * radius;
          
          this.food.add(berry);
        }
        break;
    }
  }
  
  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    // 旋转食物
    if (this.food) {
      this.food.rotation.y += 0.01;
    }
    
    // 渲染场景
    this.renderer.render(this.scene, this.camera);
  }
  
  private onWindowResize(): void {
    const container = this.rendererContainer.nativeElement;
    
    // 更新相机
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    
    // 更新渲染器
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }
} 
import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-hero-effect',
  template: `<div #rendererContainer class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30"></div>`,
  styles: []
})
export class ThreeHeroEffectComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  private animationFrameId: number | null = null;
  
  constructor() { }

  ngOnInit(): void {
  }
  
  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
    
    // 添加窗口大小调整监听器
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    // 清理Three.js资源
    if (this.particles) {
      this.scene.remove(this.particles);
      (this.particles.geometry as THREE.BufferGeometry).dispose();
      (this.particles.material as THREE.Material).dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
  
  private initThree(): void {
    // 创建场景
    this.scene = new THREE.Scene();
    
    // 创建相机
    const container = this.rendererContainer.nativeElement;
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = 30;
    
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x000000, 0); // 透明背景
    container.appendChild(this.renderer.domElement);
    
    // 创建粒子系统
    this.createParticles();
  }
  
  private createParticles(): void {
    // 创建几何体
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    // 创建粒子位置数组
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    
    // 橙色调色板
    const colorPalette = [
      new THREE.Color(0xF97316), // 橙色-500
      new THREE.Color(0xEA580C), // 橙色-600
      new THREE.Color(0xC2410C), // 橙色-700
      new THREE.Color(0x9A3412), // 橙色-800
      new THREE.Color(0xFFEDD5)  // 橙色-50
    ];
    
    // 设置随机位置和颜色
    for (let i = 0; i < particlesCount; i++) {
      // 位置
      positions[i * 3] = (Math.random() - 0.5) * 100;      // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;  // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;  // z
      
      // 颜色
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // 创建粒子材质
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    // 创建粒子系统
    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);
  }
  
  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    // 旋转粒子系统
    if (this.particles) {
      this.particles.rotation.x += 0.0005;
      this.particles.rotation.y += 0.001;
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
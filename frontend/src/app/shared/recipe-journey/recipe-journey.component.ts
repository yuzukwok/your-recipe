import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-recipe-journey',
  template: `
    <div #rendererContainer class="w-full h-[300px] overflow-hidden"></div>
  `,
  styles: []
})
export class RecipeJourneyComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private plates: THREE.Mesh[] = [];
  private journey: THREE.Group;
  
  constructor() { 
    this.journey = new THREE.Group();
  }

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
    
    // 清理资源
    this.plates.forEach(plate => {
      (plate.geometry as THREE.BufferGeometry).dispose();
      if (Array.isArray(plate.material)) {
        plate.material.forEach(m => m.dispose());
      } else {
        (plate.material as THREE.Material).dispose();
      }
    });
    
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
  
  private initThree(): void {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9A3412); // 深橙色背景
    
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
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);
    
    // 创建菜谱旅程
    this.createRecipeJourney();
    this.scene.add(this.journey);
  }
  
  private createRecipeJourney(): void {
    // 创建一条曲线路径
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10, 0, 5),
      new THREE.Vector3(-5, 0, -5),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 0, 5),
      new THREE.Vector3(10, 0, -5)
    ]);
    
    // 创建路径
    const points = curve.getPoints(100);
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const pathMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const path = new THREE.Line(pathGeometry, pathMaterial);
    this.journey.add(path);
    
    // 在路径上创建食物盘子
    const plateGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
    const plateMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    const foodTypes = [
      { color: 0xff0000, height: 0.5 }, // 红色食物
      { color: 0x00ff00, height: 0.3 }, // 绿色食物
      { color: 0xffff00, height: 0.4 }, // 黄色食物
      { color: 0xffa500, height: 0.6 }, // 橙色食物
      { color: 0x964b00, height: 0.5 }  // 棕色食物
    ];
    
    for (let i = 0; i < 5; i++) {
      // 创建盘子
      const plate = new THREE.Mesh(plateGeometry, plateMaterial);
      
      // 根据曲线位置盘子
      const position = curve.getPoint(i / 4);
      plate.position.copy(position);
      
      // 在盘子上添加食物
      const foodType = foodTypes[i];
      const foodGeometry = new THREE.CylinderGeometry(0.7, 0.7, foodType.height, 32);
      const foodMaterial = new THREE.MeshStandardMaterial({ color: foodType.color });
      const food = new THREE.Mesh(foodGeometry, foodMaterial);
      food.position.y = 0.2;
      
      plate.add(food);
      this.plates.push(plate);
      this.journey.add(plate);
    }
    
    // 添加指示器
    const indicatorGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const indicatorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5
    });
    
    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      const position = curve.getPoint(t);
      
      const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
      indicator.position.copy(position);
      indicator.position.y = -0.2;
      indicator.scale.set(0.5, 0.5, 0.5);
      
      // 错开显示时间
      setTimeout(() => {
        this.journey.add(indicator);
      }, i * 100);
    }
  }
  
  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    // 旋转整个旅程场景
    if (this.journey) {
      this.journey.rotation.y += 0.005;
    }
    
    // 使盘子旋转
    this.plates.forEach((plate, index) => {
      plate.rotation.y += 0.01 * (index + 1);
    });
    
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
import { useEffect, useRef, useState } from 'react';
import main from './api-connection.js';
import Navbar from './navbar'; // import Navbar component
import './canvas.css';

const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [inputValue, setInputValue] = useState<string>(''); // Add state for inputValue
    let count = 0;
    let allnode = useRef<Node[]>([]);
    let Datetime = new Date().toLocaleTimeString();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
    
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        let canvasWidth = 1000;
        let canvasHeight = window.innerHeight - 30;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.background = "#fff";
    
        setContext(ctx);
    
        const handleDblClick = (event: MouseEvent) => {
            for (let i = 0; i < allnode.current.length; i++) {
                allnode.current[i].clickOnNode(event, 0);
            }
        };
    
        canvas.addEventListener('dblclick', handleDblClick);
    
        // Cleanup function to remove event listener on unmount
        return () => {
            canvas.removeEventListener('dblclick', handleDblClick);
        };
    }, [canvasRef.current]);

    const handleButtonClick = () => {
        if (!context) {
            return;
        }
        // เคลียร์ canvas
        context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        // เริ่มโหนดใหม่
        count = 0;
        allnode.current = [];
        // สร้างโหนดแรก
        let First_node = new Node(0,((1000 / 2) - 80), (((window.innerHeight - 30) / 2) - 30) + 50, 170 + ((inputValue.length / 40) * 160), 80, inputValue, '#6495ed');
        allnode.current.push(First_node);
        First_node.drawNode();
        Datetime = new Date().toLocaleTimeString();
        First_node.clickOnNode(MouseEvent,1);
        // เก็บข้อมูลโหนดใหม่ลงใน localStorage
        First_node.storeData();
        // เรียก redrawCanvas เพื่อลบทุกอย่างบนแคนวาสและวาดโหนดใหม่ทั้งหมด
        redrawCanvas();

        // สร้าง animation
        let animationID00: number;
        const animation = () => {
            animationID00 = requestAnimationFrame(animation);
            First_node.Update(animationID00);
        };
        animation();
    };
    
    const clickHistory = (topic: string) => {
        const storedHistory = localStorage.getItem('history');
        if (storedHistory) {
            context!.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            count = 0;
            allnode.current = [];
            let parseHistory = JSON.parse(storedHistory);
            for (let i = 0; i < parseHistory.length; i++) {
                if(parseHistory[i].text == topic){
                    let newnode = parseHistory[i].node;
                    for(let j = 0; j < newnode.length ; j++){
                        let createnode = new Node(newnode[j].id,newnode[j].x,newnode[j].y,newnode[j].width,newnode[j].height,newnode[j].text,newnode[j].color);
                        createnode.clicknode = newnode[j].clicknode;
                        createnode.childNode = newnode[j].childNode;
                        createnode.motherNode = newnode[j].motherNode;
                        allnode.current.push(createnode);
                        createnode.drawNode();
                    }
                }
              }
              count = allnode.current.length-1;
              redrawCanvas();
          }
    }

    // Event listeners for dragging, zooming, and canvas panning
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let isDragging = false;
        let selectedNode: Node | null = null;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let isDraggingCanvas = false;
        let lastCanvasX = 0;
        let lastCanvasY = 0;
        const scrollSpeedFactor = 0.8; // ปรับค่าได้ตามต้องการเพื่อเปลี่ยนความเร็วในการเลื่อน

        const handleMouseDown = (event: MouseEvent) => {
            lastMouseX = event.offsetX;
            lastMouseY = event.offsetY;
            for (let i = allnode.current.length - 1; i >= 0; i--) {
                const node = allnode.current[i];
                if (event.offsetX >= node.x && event.offsetX <= node.x + node.width && event.offsetY >= node.y && event.offsetY <= node.y + node.height) {
                    isDragging = true;
                    selectedNode = node;
                    break;
                }
            }
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (isDragging && selectedNode) {
                const deltaX = event.offsetX - lastMouseX;
                const deltaY = event.offsetY - lastMouseY;
                selectedNode.x += deltaX;
                selectedNode.y += deltaY;
                lastMouseX = event.offsetX;
                lastMouseY = event.offsetY;
                redrawCanvas();
            }
        };

        const handleMouseUp = () => {
            isDragging = false;
            selectedNode = null;
            if (allnode.current.length > 0) {
                allnode.current[0].storeData();
            }
        };

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            if (event.deltaY < 0) {
                zoom(1.05);
            } else {
                zoom(0.95);
            }
        };


        const handleCanvasMouseDown = (event: MouseEvent) => {
            let isInsideNode = false;
            for (let node of allnode.current) {
                if (event.offsetX >= node.x && event.offsetX <= node.x + node.width && event.offsetY >= node.y && event.offsetY <= node.y + node.height) {
                    isInsideNode = true;
                    break;
                }
            }
            if (!isInsideNode) {
                lastCanvasX = event.offsetX;
                lastCanvasY = event.offsetY;
                isDraggingCanvas = true;
            }
        };

        const handleCanvasMouseMove = (event: MouseEvent) => {
            if (isDraggingCanvas) {
                const deltaX = (event.offsetX - lastCanvasX) * scrollSpeedFactor;
                const deltaY = (event.offsetY - lastCanvasY) * scrollSpeedFactor;
                for (let node of allnode.current) {
                    node.x += deltaX;
                    node.y += deltaY;
                }
                lastCanvasX = event.offsetX;
                lastCanvasY = event.offsetY;
                redrawCanvas();
            }
        };

        const handleCanvasMouseUpOrLeave = () => {
            isDraggingCanvas = false;
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel);
        canvas.addEventListener('mousedown', handleCanvasMouseDown);
        canvas.addEventListener('mousemove', handleCanvasMouseMove);
        canvas.addEventListener('mouseup', handleCanvasMouseUpOrLeave);
        canvas.addEventListener('mouseleave', handleCanvasMouseUpOrLeave);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('mousedown', handleCanvasMouseDown);
            canvas.removeEventListener('mousemove', handleCanvasMouseMove);
            canvas.removeEventListener('mouseup', handleCanvasMouseUpOrLeave);
            canvas.removeEventListener('mouseleave', handleCanvasMouseUpOrLeave);
        };
    }, [canvasRef.current]);

    class Node {
        id: number;
        x: number;
        y: number;
        width: number;
        height: number;
        text: string;
        color: string;
        clicknode: number;
        childNode: number[];
        animationtime: number;
        motherNode: number;

        constructor(id: number, x: number, y: number, width: number, height: number, text: string, color: string) {
            this.id = id;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.text = text;
            this.color = color;
            this.clicknode = 0;
            this.childNode = [];
            this.motherNode = 0;
            this.animationtime = 0;
        }

            // เมธอดสำหรับวาดโหนด
        drawNode() {
            if(context) {
                context.fillStyle = this.color;
                context.beginPath();
                context.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
                context.fill();
                context.fillStyle = '#000000';
                context.stroke();
                context.font = "16px Arial";
                context.textAlign = 'center';

                // วัดขนาดของข้อความ
                const textMetrics = context.measureText(this.text);
                const textWidth = textMetrics.width;

                // ซ่อนข้อความถ้า node กว้างน้อยกว่าข้อความ
                if (this.width > textWidth+1) {
                    context.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2 + 5);
                } else {
                    context.fillText('', this.x + this.width / 2, this.y + this.height / 2 + 5);
                }
            }
        }

    // เมธอดสำหรับตรวจจับเหตุการณ์คลิกที่โหนด
    async clickOnNode(this: Node, event: any, check: number) {
        if (event.offsetX >= this.x &&
            event.offsetX <= this.x + this.width &&
            event.offsetY >= this.y &&
            event.offsetY <= this.y + this.height || check == 1) {
            let allmotherbefore: string[] = []; // เก็บข้อความของโหนดก่อนหน้า
            let allnodeText: string[] = [];
            // ตรวจสอบว่าตำแหน่งเมาส์ที่คลิกอยู่ภายในขอบเขตของโหนดหรือไม่

            const A = new main();

            let currentNode = this;
            while(currentNode.motherNode != 0){
                allmotherbefore.push(allnode.current[currentNode.motherNode].text);
                currentNode = allnode.current[currentNode.motherNode];
            }
            for (let node of allnode.current) {
                allnodeText.push(node.text)
            }

            const jsonData = await A.fetchCompletions(this.text , allmotherbefore.join(',') , allnodeText.join(','));

            // ตรวจสอบให้แน่ใจว่า jsonData มีโครงสร้างที่ถูกต้องและมีข้อมูลที่ต้องการ
            if (jsonData.length > 0) {
                const data = jsonData[0];
                this.createAdjacentNodes(data);
                this.clicknode++;
            }
        }
    }

            drawLine(x1: number, y1: number, x2: number, y2: number) {
                if(context) {
                    context.beginPath();
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                    context.lineWidth = 2;
                    context.stroke();
                }
            }

            createAdjacentNodes(data: any) {
                context!.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
                let animationID01: number | null = null;
                let animationID02: number | null = null;
                let animationID03: number | null = null;
                let animationID04: number | null = null;
                if (this.clicknode === 0) {
                    // สร้างโหนดที่ตำแหน่งข้างๆ Node หลัก
                    let childNode1 = this.findEmptyPositionNearby(this.x - 280, this.y, data.Output1);
                    let childNode2 = this.findEmptyPositionNearby(this.x + 240, this.y, data.Output2);
                    let childNode3 = this.findEmptyPositionNearby(this.x, this.y - 120, data.Output3);
                    let childNode4 = this.findEmptyPositionNearby(this.x, this.y + 120, data.Output4);
            
                    // ตรวจสอบว่าโหนดใหม่ไม่เป็น null หรือไม่
                    if (childNode1) {
                        this.childNode.push(childNode1.id);
                        childNode1.motherNode = this.id;
                        allnode.current.push(childNode1);
                    }
                    if (childNode2) {
                        this.childNode.push(childNode2.id);
                        childNode2.motherNode = this.id;
                        allnode.current.push(childNode2);
                    }
                    if (childNode3) {
                        this.childNode.push(childNode3.id);
                        childNode3.motherNode = this.id;
                        allnode.current.push(childNode3);
                    }
                    if (childNode4) {
                        this.childNode.push(childNode4.id);
                        childNode4.motherNode = this.id;
                        allnode.current.push(childNode4);
                    }
            
                    //วาดเส้นเชื่อมโหนดลูกกับโหนดแม่
                    if (childNode1)
                        this.drawLine(this.x + this.width / 2, this.y + this.height / 2, childNode1.x + childNode1.width / 2, childNode1.y + childNode1.height / 2);
                    if (childNode2)
                        this.drawLine(this.x + this.width / 2, this.y + this.height / 2, childNode2.x + childNode2.width / 2, childNode2.y + childNode2.height / 2);
                    if (childNode3)
                        this.drawLine(this.x + this.width / 2, this.y + this.height / 2, childNode3.x + childNode3.width / 2, childNode3.y + childNode3.height / 2);
                    if (childNode4)
                        this.drawLine(this.x + this.width / 2, this.y + this.height / 2, childNode4.x + childNode4.width / 2, childNode4.y + childNode4.height / 2);

                    
                    if (childNode1){
                        childNode1.drawNode();
                        let animation = function(){
                            animationID01 = requestAnimationFrame(animation);
                            childNode1.Update(animationID01!);
                        }
                        animation();
                    }
                    if (childNode2){
                        childNode2.drawNode();
                        let animation = function(){
                            animationID02 = requestAnimationFrame(animation);
                            childNode2.Update(animationID02!);
                        }
                        animation();
                    }
                    if (childNode3){
                        childNode3.drawNode();
                        let animation = function(){
                            animationID03 = requestAnimationFrame(animation);
                            childNode3.Update(animationID03!);
                        }
                        animation();
                    }
                    if (childNode4){
                        childNode4.drawNode();
                        let animation = function(){
                            animationID04 = requestAnimationFrame(animation);
                            childNode4.Update(animationID04!);
                        }
                        animation();
                    }
                }
            }

            findEmptyPositionNearby(x: number, y: number, text: string) {
                const step: number = 2; // ขนาดของขั้นตอนในการเลื่อน
                const maxStep: number = 50; // จำนวนขั้นตอนสูงสุด
                let newX: number = x;
                let newY: number = y;
                let stepCount: number = 0;
                // วนลูปเพื่อหาตำแหน่งที่ว่าง
                while (stepCount < maxStep) {
                    let overlapping: boolean = false;
                    // ตรวจสอบว่าตำแหน่งใหม่ซ้อนทับกับโหนดที่มีอยู่
                    for (let node of allnode.current) {
                        if (this.isOverlap(newX, newY, node)) {
                            overlapping = true;
                            break;
                        }
                    }
                    // ถ้าไม่มีการซ้อนทับให้สร้างโหนดใหม่
                    if (!overlapping) {
                        count++;
                        const nodeColor: string = count < 5 ? '#4682b4' : '#ffffff';
                        return new Node(count,newX, newY + 50, 170 + ((text.length / 40) * 160), 70, text, nodeColor);
                    }
                    // เลื่อนไปทางขวา
                    newX += step;
                    stepCount++;
                }
                // ถ้าไม่พบตำแหน่งที่ว่างภายใน maxStep ขั้นตอน ให้คืนค่า null
                return null;
            }

            isOverlap(x: number, y: number, node: Node): boolean {
                return !(x + 140 < node.x || x > node.x + node.width || y + 60 < node.y || y > node.y + node.height);
            }
            
            storeData(): void {
                let allNodesFromStorage: { node: Node[], text: string ,time: string}[] = JSON.parse(localStorage.getItem('history') || '[]'); // ดึงข้อมูลเดิมจาก localStorage
            
                // ตรวจสอบว่ามีข้อมูลหัวข้อนี้อยู่ใน localStorage หรือไม่
                const existingIndex = allNodesFromStorage.findIndex(item => item.text === allnode.current[0].text);
                if (existingIndex !== -1) {
                    // ถ้ามีให้ทำการเขียนทับข้อมูลของหัวข้อตัวเองใน localStorage
                    allNodesFromStorage[existingIndex].node = allnode.current;
                } else {
                    // ถ้าไม่มีให้เพิ่มข้อมูลใหม่เข้าไปในอาร์เรย์ของข้อมูลเดิม
                    allNodesFromStorage.push({ node: allnode.current, text: allnode.current[0].text, time: Datetime });
                }
            
                const stringifiedObject: string = JSON.stringify(allNodesFromStorage); // แปลงอาร์เรย์ข้อมูลทั้งหมดเป็นสตริง
                localStorage.setItem('history', stringifiedObject); // เซฟข้อมูลทั้งหมดลงใน localStorage
            }
              

            Update(animationID: number): void {
                redrawCanvas();
                if (this.animationtime === 50) {
                    cancelAnimationFrame(animationID);
                    this.storeData();
                }
                this.y -= 1;
                this.animationtime++;
            }
    }

    const redrawCanvas = () => {
        if (!context || !canvasRef.current) {
            return;
        }
        // ลบทุกอย่างบน Canvas
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        // วาดโหนดทั้งหมดใน allnode
        for (const node of allnode.current) {
            for (const line of node.childNode) {
                node.drawLine(node.x + node.width/2 , node.y + node.height/2,allnode.current[line].x + allnode.current[line].width/2,allnode.current[line].y + allnode.current[line].height/2 );
            }
            node.drawNode();
        }
    }

    function zoom(scaleFactor: number) {
        if (!canvasRef.current) {
            return
        }
        for (let node of allnode.current) {
            node.width *= scaleFactor;
            node.height *= scaleFactor;
            // ปรับตำแหน่งของโหนด
            node.x = (node.x - canvasRef.current.width / 2) * scaleFactor + canvasRef.current.width / 2;
            node.y = (node.y - canvasRef.current.height / 2) * scaleFactor + canvasRef.current.height / 2;
        }
        // วาดโหนดทั้งหมดใหม่
        redrawCanvas();
    }

    return (
        <div style={{display : 'flex', justifyContent : 'space-evenly'}}>
            <Navbar handleButtonClick={handleButtonClick} inputValue={inputValue} setInputValue={setInputValue} clickHistory={function (topic: string): void {clickHistory(topic);} }/>
            <canvas ref={canvasRef} />
        </div>
    );
}

export default Canvas;

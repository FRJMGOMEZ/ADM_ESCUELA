import { Component, OnInit, ViewChild, ElementRef, Renderer2} from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent {

  public chart: Chart = null;

  public data:number[]=[]
  public labels:string[]=[]

  public dataLabel:string;

  public chartId:string='initial';

  public labelFontSize:number = 12;

  @ViewChild('canvasRef') canvasRef : ElementRef;

  constructor( private renderer:Renderer2){

  }
  
  setInfo(labels:string[],data:number[],id:string,dataLabel:string){
    this.dataLabel=dataLabel;
    this.labels=labels;
    this.data = data;
    this.chartId = id;
    this.checkLabelsSize().then((size:number)=>{
      this.labelFontSize = size;
      this.render();
    })
  }

  render(){
    console.log(this.labelFontSize);
    this.renderer.setProperty(this.canvasRef.nativeElement, 'id', this.chartId);
    this.chart = new Chart(this.chartId, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          { 
            label:this.dataLabel,
            fill: false,
            data: this.data,
            backgroundColor: '#168ede',
            borderColor: '#168ede'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
          enabled: false
        },
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            fontColor: 'white'
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              fontSize:this.labelFontSize,
              fontColor: "blue"
            }
          }],
          xAxes: [{
            ticks: {
              fontSize: this.labelFontSize,
              fontColor: "red",
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  onResize(){
    this.checkLabelsSize().then((size:number)=>{
      this.labelFontSize = size;
      this.render()
    })  
  }

  setStyle(opacity:string,pointer?:string){
    this.renderer.setStyle(this.canvasRef.nativeElement,'opacity',opacity);
    if(pointer){this.renderer.setStyle(this.canvasRef.nativeElement,'cursor',pointer)};
  }

  checkLabelsSize(){
    return new Promise((resolve,reject)=>{
      if (window.innerHeight > 693) {
        if (window.innerHeight > 832) {
          if (window.innerHeight > 1249) {
            if (window.innerHeight > 2499) {
              resolve(28);
            } else {
              resolve(24);
            }

          } else {
            resolve(20)
          }

        } else {
          resolve(16);
        }

      } else {
       resolve(12);
      }
    })
    }
}
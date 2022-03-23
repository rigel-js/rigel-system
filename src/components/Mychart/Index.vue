<template>
	<div :id="chartId" style="height: 120px; width: 210px;">
	</div>
</template>

<script>
import {transform} from 'echarts-stat';
import * as ecStat from 'echarts-stat';
export default {
	name: 'Mychart',
	props: {
		chartId: String,
		attr: { 
			type: Object,
			required: true,
		},
	},
	mounted() {
		console.log(this.attr.valueList);
		if(this.attr.valueList.length <= 1 || this.attr.isCategorical) {
			this.drawLine_barchart(this.attr.valueList);
		} else {
			this.drawLine_histogram(this.attr.valueList);
		}
	},
	methods: {
		drawLine_barchart(valueList) {
			let myChart = this.$echarts.init(document.getElementById(this.chartId));
			let tmp = [];
			for(let i = 0; i < valueList.length; i++) tmp.push(1);
			var option = {
				grid: {
					left: 10,
					right: 0,
					top: 10,
					bottom: 0,
					containLabel: true
				},
				yAxis: {
					type: 'value',
					axisLabel: {
						show: false
					}
				},
				xAxis: {
					type: 'category',
					data: valueList,
					axisLabel: {
						interval: 0,
					}
				},
				series: [
					{
						name: '2011',
						type: 'bar',
						data: tmp,
					},
				]
			};

      myChart.setOption(option);
		},
		drawLine_histogram(valueList) {
			this.$echarts.registerTransform(transform.histogram);
			let myChart = this.$echarts.init(document.getElementById(this.chartId));
			// var girth = [8.3,8.6, 8.8, 10.5, 10.7, 10.8, 11.0, 11.0, 11.1, 11.2, 11.3, 11.4, 11.4, 11.7, 12.0, 12.9, 12.9, 13.3, 13.7, 13.8, 14.0, 14.2, 14.5, 16.0, 16.3, 17.3, 17.5, 17.9, 18.0, 18.0, 20.6];
			var bins = ecStat.histogram(valueList, 'sturges');
			// console.log(bins.data);

			var option = {
					color: ['rgb(25, 183, 207)'],
					grid: {
							left: 10,
							right: 10,
							top: 10,
							bottom: 0,
							containLabel: true
					},
					xAxis: {
							// boundaryGap: '5%',
						scale: true, //这个一定要设，不然barWidth和bins对应不上
						axisLabel: {
							rotate: 15,
						}
					},
					yAxis: {
					},
					series: [{
							name: 'height',
							type: 'bar',
							barWidth: '99.3%',
							// barCategoryGap: 0,
							// label: {
							// 	normal: {
							// 		show: true,
							// 		position: 'insideTop'
							// 	}
							// },
							data: bins.data
					}]
			};
			myChart.setOption(option);
			// setTimeout(function (){
			// 		window.onresize = function () {
			// 			myChart.resize();
			// 		}
			// },200)
		}
	}
}
</script>
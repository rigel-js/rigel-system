<template>
	<div v-if="this.finalContent">
		<Mycollapse>
			<Mycollapsepanel v-for="(item, index) in this.finalContent" :key="index" :header="`Add ${item.add}`">
				<Mycollapse>
					<Mycollapsepanel v-for="(spec, index2) in item.list" :key="index2" :header="spec.description">
						<Mycollapse>
							<Mycollapsepanel header="Alternatives (Rearrange current attributes)" :spec="spec"> 
								<!-- <Varunit :spec="spec"/> -->
							</Mycollapsepanel>
							<Mycollapsepanel header="Variations (Add more attributes)">
							</Mycollapsepanel>
						</Mycollapse>
					</Mycollapsepanel>
				</Mycollapse>
			</Mycollapsepanel>
		</Mycollapse>
	</div>
</template>

<script>

export default {
  name: "Varunit",
  props: {
    content: {
			type: Array,
			default: null
		},
		spec: {
			type: Object,
			default: undefined
		}
  },
  data() {
    return {
			newContent: null
    };
  },
	computed: {
		finalContent() {
			if(this.content) return this.content;
			return this.newContent;
		}
	},
	mounted() {
		if(!this.content && this.spec){
			this.newContent = this.calcAlter(this.spec);
		}
	},
  methods: {
    calcAlter(spec) {
			// calculation
			return ([
        {
            "add": "union(a,b)",  // string
            "list": [
                {   // spec数组
                    "row_header": null,
                    "column_header": null,
                    "body": null,
                    "description": "(a), (b) => (c)",
                },
            ]
        } 
      ]);
		},
		handleClick(e) {
			console.log("test");
			console.log(this.content);
		}
  },
  // components: {
  //   Mycollapse,
	// 	Mycollapsepanel
  // },
};
</script>


<template>
  <div>
      <slot/>
  </div>
</template>

<script>
export default {
  name: "Newcollapse",
  props: {
    // value: {
		// 	type: Array,
		// 	required: true,
    // },
		activeClass: {
			type: String,
			default: "r-collapse-panel-active",
		},
		accordian: {
			type: Boolean,
			default: false
		}
  },
	watch: {
		value(val, oldval) {
			// console.log("new", val);
			if (this.accordion && val.length > 1) {
				// this.$emit('input', [val[0]]);
				this.value = [val[0]];
			}
		}
	},
	mounted() {
		this.$on("open", this.handlePanelOpen);
		this.$on("close", this.handlePanelClose);
	},
	data() {
		return ({
			value: []
		});
	},
  methods: {
    handlechange(newActiveKeys, oldActiveKeys) {
      console.log("newActiveKeys", newActiveKeys);
      console.log("oldActiveKeys", oldActiveKeys);
    },
		handlePanelOpen(key) {
			// console.log("recvopen", key);
			let newArr = [];
			if (this.accordion) {
				newArr = [key];
			} else {
				newArr = [
					...this.value,
					key,
				];
			}
			/**
			 * 可用v-model代替
			 */
			// this.$emit('input', newArr);
			// this.$emit('change', newArr, this.value);
			this.value = newArr;
		},
		handlePanelClose(key) {
			// console.log(this.value, key);
			const tmp = [];
			this.value.forEach((item) => {
				if (item != key) {
					tmp.push(item);
				}
			});
			// this.$emit('input', tmp);
			// this.$emit('change', tmp, this.value);
			this.value = tmp;
		}
  },
};
</script>

<style lang="scss">
.collapse-demo {
  width: 100%;
  cursor: pointer;
  // .collapse-demo-panel.collapse-demo-active {
  //   .collapse-fixed > i {
  //     transform: rotate(180deg) !important;
  //   }
  // }
}
</style>
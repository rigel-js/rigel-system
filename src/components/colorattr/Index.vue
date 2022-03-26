<template>
  <span class="colorattr" v-html="this.realSpec"></span>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "colorattr",
  props: {
    spec: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      realString: undefined,
    };
  },
  computed: {
    ...mapState(["attrInfo"]),
    realSpec() {
      if (this.realString) {
        return this.realString;
      } else {
        return this.spec;
      }
    },
  },
  mounted() {
    let oldString = this.spec;
    let newString = "",
      lastIndex = 0;
    for (let i = 0; i < oldString.length; i++) {
      if (oldString[i] == ".") {
        let index1 = this.findAttr(oldString, i, -1);
        let index2 = this.findAttr(oldString, i, 1);
        let attr1 = oldString.slice(index1, i);
        let attr2 = oldString.slice(i + 1, index2 + 1);
        // console.log(index1, index2, attr1, attr2);
        let color = undefined;
        for (let j = 0; j < this.attrInfo.length; j++) {
          if (
            this.attrInfo[j].data == attr1 &&
            this.attrInfo[j].attribute == attr2
          ) {
            color = this.attrInfo[j].color;
            break;
          }
        }
        if (color) {
          newString += oldString.slice(lastIndex, index1);
          newString += `<span style="color: ${color}">${oldString.slice(
            i + 1,
            index2 + 1
          )}</span>`;
          lastIndex = index2 + 1;
        }
      } else if(i + 1 < oldString.length && oldString[i] == '=' && oldString[i+1] == '>') {
				newString += oldString.slice(lastIndex, i);
				newString += '-';
				lastIndex = i + 1;
			}
    }
    newString += oldString.slice(lastIndex);
    this.realString = newString;
    // console.log(this.realString);
  },
  methods: {
    isAlpha(s) {
      return (s >= "a" && s <= "z") || (s >= "A" && s <= "Z");
    },
    isDigit(s) {
      return s >= "0" && s <= "9";
    },
    findAttr(oldString, index, delta) {
      for (
        let i = index + delta;
        i >= -1 && i <= oldString.length;
        i += delta
      ) {
        let ok = true;
        if (i == 0 || i == oldString.length) {
          ok = false;
        } else {
          if (
            this.isAlpha(oldString[i]) ||
            oldString[i] == "-" ||
            this.isDigit(oldString[i]) ||
            oldString[i] == "_"
          ) {
            ok = true;
          } else {
            ok = false;
          }
        }
        // console.log(i, ok);
        if (!ok) {
          if (delta == 1) {
            return i - 1;
          } else {
            return i + 1;
          }
        }
      }
      return "";
    },
  },
};
</script>

<style scoped>
.colorattr {
  display: inline-block;
}
</style>

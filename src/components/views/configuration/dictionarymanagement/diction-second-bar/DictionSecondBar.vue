<template>
  <div class='secondbar-content'>
    <ul class='secondbar-wrapper'>
      <li class="tab one-tab" :class="{'current-tab': currentTab === 'diction-treatment-plan'}" @click="chooseTreatmentPlan">治疗方案</li>
      <li class="tab two-tab" :class="{'current-tab': currentTab === 'diction-medical-scale'}" @click="chooseMedicalScale">医学量表</li>
      <li class="tab three-tab" :class="{'current-tab': currentTab === 'dictioninspection'}" @click="chooseInspection">检验检查</li>
      <li class="tab four-tab" :class="{'current-tab': currentTab === 'dictionimage-datas'}" @click="chooseImageDatas">影像资料</li>
      <li class="tab-bottom-bar" :class="currentTabBottomBar"></li>
    </ul>
    <div class="scroll-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>

export default {
  computed: {
    currentTab() {
      let path = this.$route.path;
      let reTreatmentPlan = new RegExp(/\/diction-treatment-plan(\/|$)/);
      let reMedicalScale = new RegExp(/\/diction-medical-scale(\/|$)/);
      let reInspection = new RegExp(/\/dictioninspection(\/|$)/);
      let reImageDatas = new RegExp(/\/dictionimage-datas(\/|$)/);
      if (reTreatmentPlan.test(path)) {
        return 'diction-treatment-plan';
      } else if (reMedicalScale.test(path)) {
        return 'diction-medical-scale';
      } else if (reInspection.test(path)) {
        return 'dictioninspection';
      } else if (reImageDatas.test(path)) {
        return 'dictionimage-datas';
      } else {
        // 逻辑正确的话，不会返回这行的。只是怕以后路由修改，出现问题。
        return 'something wrong here';
      }
    },
    currentTabBottomBar() {
      if (this.currentTab === 'diction-treatment-plan') {
        return 'first-tab';
      } else if (this.currentTab === 'diction-medical-scale') {
        return 'second-tab';
      } else if (this.currentTab === 'dictioninspection') {
        return 'third-tab';
      } else if (this.currentTab === 'dictionimage-datas') {
        return 'fourth-tab';
      } else {
        return 'Oops! check currentTab';
      }
    }
  },
  methods: {
    chooseTreatmentPlan() {
      if (!/\/diction-treatment-plan(\/|$)/.test(this.$route.path)) {
        this.$router.push({ name: 'diction-treatment-plan' });
      }
    },
    chooseMedicalScale() {
      if (!/\/diction-medical-scale(\/|$)/.test(this.$route.path)) {
        this.$router.push({ name: 'diction-medical-scale' });
      }
    },
    chooseInspection() {
      if (!/\/dictioninspection(\/|$)/.test(this.$route.path)) {
        this.$router.push({ name: 'dictioninspection' });
      }
    },
    chooseImageDatas() {
      if (!/\/dictionimage-datas(\/|$)/.test(this.$route.path)) {
        this.$router.push({ name: 'dictionimage-datas' });
      }
    }
  },
  mounted() {
    if (!/\/diction-treatment-plan(\/|$)/.test(this.$route.path)) {
      this.$router.push({ name: 'diction-treatment-plan' });
    };
  },
  components: {
  }
};
</script>

<style lang="less" scoped>
@import "~styles/variables.less";
@tabs-wrapper-height: 40px;
@tab-width: 70px;
@first-tab-x: 20px;
@second-tab-x: 120px;
@third-tab-x: 220px;
@fourth-tab-x: 320px;
@margin-right: 20px;
@first-bar-height: 60px;
@second-bar-height: 45px;

.secondbar-content {
  position: relative;
  height: calc(~"100% - @{first-bar-height}");
  .secondbar-wrapper {
    position: relative;
    margin: 0 @margin-right @vertical-spacing 0;
    height: @tabs-wrapper-height;
    background-color: @background-color;
    box-shadow: 0 10px 10px @screen-color;
    list-style: none;
    .tab {
      position: absolute;
      width: @tab-width;
      line-height: 40px;
      box-sizing: border-box;
      font-size: @large-font-size;
      font-weight: bold;
      cursor: pointer;
      color: @inverse-font-color;
      &:hover {
        color: darken(@inverse-font-color, 10%);
      }
      &.one-tab {
        left: @first-tab-x;
      }
      &.two-tab {
        left: @second-tab-x;
      }
      &.three-tab {
        left: @third-tab-x;
      }
      &.four-tab {
        left: @fourth-tab-x;
      }
      &.current-tab {
        color: @button-color;
      }
    }
    .tab-bottom-bar {
      position: absolute;
      width: @tab-width;
      height: 3px;
      bottom: 0;
      background-color: @button-color;
      left: @first-tab-x;
      transition: transform 0.2s;
      &.first-tab {
        transform: translate3d(0, 0, 0);
      }
      &.second-tab {
        transform: translate3d(100px, 0, 0);
      }
      &.third-tab {
        transform: translate3d(200px, 0, 0);
      }
      &.fourth-tab {
        transform: translate3d(300px, 0, 0);
      }
    }
  }
  .scroll-content {
    position: relative;
    height: calc(~"100% - @{second-bar-height}");
  }
}
</style>

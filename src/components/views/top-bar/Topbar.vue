<template lang="html">
  <div class="top-bar-wrapper">
    <div class="top-bar">
      <div class="organization-wrapper" @click.stop="toggleOranizationPanelDisplay">
        <span class="name">{{title}}</span>
        <span class="iconfont" :class="toggleOranizationPanelIcon"></span>
      </div>
      <div class="switch-button">
        <span class="on" :class="switchButtonSide"></span>
        <span class="text left" @click="switchBlockSensitiveStatus(true)">脱敏显示</span>
        <span class="text right" @click="switchBlockSensitiveStatus(false)">全部显示</span>
      </div>
      <div class="operation-wrapper">
        <!-- <a class="iconfont icon-question" target="_blank" href="https://shimo.im/docs/kkrtBy4AuA0v24t5/"></a> -->
        <a class="iconfont icon-question" target="_blank" href="/static/files/欢迎使用睿云2.3-PC端.pdf"></a>
        <span class="iconfont icon-search" :class="{'on': showFilterPanel}" @click="toggleFilterPanelDisplay"></span>
        <span class="iconfont icon-notice" v-show="false"></span>
        <span class="iconfont icon-task" v-show="false"></span>
        <span class="account" @click.stop="toggleAccountPanelDisplay">
          <img src="~img/profile.png" alt="doctor image" class="picture">
          <span v-if="isSupportAccount" class="support-mark">授</span>
          <span class="name" :class="{'on': showAccountPanel}">
            <span v-if="isSupportAccount">{{supportedDoctorName}}</span>
            <span v-else>{{accountName}}</span>
          </span>
        </span>
      </div>
    </div>

    <div class="shadow-border"></div>
    <div class="organization-panel" :class="{'hide': !showOranizationPanel}">
      <div class="hospital-items">
        <div class="item" @click.stop="chooseSubject({})">{{orgName}}</div>
      </div>
      <div class="seperate-line"></div>
      <div class="subject-items">
        <div v-for="item in subjects">
          <span class="item" :class="{'not-optional': item.tasks && item.tasks.length>0}"
            @click.stop="chooseSubject(item)">{{item.taskName}}</span>
          <span class="item sub-item" v-for="subItem in item.tasks" @click.stop="chooseSubject(subItem)">
            {{subItem.taskName}}
          </span>
        </div>
      </div>
    </div>
    <div class="account-panel" :class="{'hide': !showAccountPanel}">
      <p class="operate-item" v-if="allowAuthorization" @click="authorize">授权技术支持</p>
      <div class="seperate-line" v-if="allowAuthorization"></div>
      <p class="operate-item" v-if="isSupportAccount" @click="reselectDoctor">更换授权医生</p>
      <div class="seperate-line" v-if="isSupportAccount"></div>
      <p class="operate-item" @click="setPrintTemp" v-if="isHasRightToExport">导出模板设置</p>
      <div class="seperate-line" v-if="isHasRightToExport"></div>
      <p class="operate-item" @click="resetPassword">修改密码</p>
      <div class="seperate-line"></div>
      <p class="operate-item" @click="logout">退出登录</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Bus from 'utils/bus.js';
import { getAuthenticationList } from 'api/user.js';
import { queryExportUsername, getGeographicalList } from 'api/patient.js';

const WAITING_TO_CHANGE = 'waitingToChange';
const NEED_TO_QUERY_AGAIN = 'needToQueryAgain';
export default {
  props: {
    showFilterPanel: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showOranizationPanel: false,
      showAccountPanel: false,
      blockSensitiveInfo: true,
      technicalSupportAccountInfo: null,
      isShowPrintTemplate: false
    };
  },
  computed: {
    ...mapGetters([
      'isHasRightToExport'
    ]),
    toggleOranizationPanelIcon() {
      return this.showOranizationPanel ? 'icon-up' : 'icon-down';
    },
    title() {
      var subjectName = sessionStorage.getItem('subjectName');
      subjectName = subjectName ? subjectName : '';
      return this.$store.state.subjectId === this.SUBJECT_ID_FOR_HOSPITAL ? this.orgName : subjectName;
    },
    accountName() {
      var name = sessionStorage.getItem('name');
      return name ? name : '';
    },
    orgName() {
      var orgName = sessionStorage.getItem('orgName');
      return orgName ? orgName : '';
    },
    subjects() {
      var subjects = sessionStorage.getItem('subjects');
      subjects = JSON.parse(subjects);
      return subjects;
    },
    isSupportAccount() {
      // 1 患者 2 医生 3 管理员 4 医院管理员 5 技术支持人员
      return Number(sessionStorage.getItem('userType')) === 5;
    },
    supportedDoctor() {
      var supportedDoctor = sessionStorage.getItem('supportedDoctor');
      return supportedDoctor ? JSON.parse(supportedDoctor) : {};
    },
    supportedDoctorName() {
      return this.supportedDoctor.doctorName ? this.supportedDoctor.doctorName : '';
    },
    switchButtonSide() {
      if (this.blockSensitiveInfo) {
        return 'left';
      } else {
        return 'right';
      }
    },
    allowAuthorization() {
      return Number(sessionStorage.getItem('userType')) === 2;
    }
  },
  methods: {
    chooseSubject(subject) {
      if (subject.tasks && subject.tasks.length > 0) {
        return;
      }

      var subjectId = subject.id ? subject.id : this.SUBJECT_ID_FOR_HOSPITAL;
      var hospitalType = subject.hospType !== undefined ? subject.hospType : this.HOSPITAL_TYPE_WITHOUT_SUBJECT;
      var subjectName = subject.taskName ? subject.taskName : '';
      var subjectCode = subject.taskCode ? subject.taskCode : '';

      if (subjectId !== this.$store.state.subjectId) {
        this.$store.commit('UPDATE_SUBJECT_ID', subjectId);
        this.$store.commit('UPDATE_HOSPITAL_TYPE', hospitalType);

        sessionStorage.setItem('subjectId', subjectId);
        sessionStorage.setItem('subjectName', subjectName);
        sessionStorage.setItem('subjectCode', subjectCode);
        sessionStorage.setItem('hospitalType', hospitalType);

        // 等面板缩起的动画结束再进行路由跳转
        setTimeout(() => {
          this.$router.push('/');
        }, 150);
      }
      this.showOranizationPanel = false;
    },
    switchBlockSensitiveStatus(status) {
      if (!status) {
        if (!this.$store.state.hasRightToDisplaySensitiveInfo) {
          let title = '确认提醒';
          let desc = '你正在修改系统默认的显示方式，有可能会带来隐私泄漏的风险。' +
          '为确保账户及患者数据安全，切换为【全部显示】状态时需要手机验证，验证通过后才能进行切换。';
          // Bus.$emit(this.SHOW_MESSAGE_MODAL, 3, title, desc);    // 第一个参数 3 代表脱敏业务
          Bus.$emit(this.MOUNT_DYNAMIC_COMPONENT, 'messageModal', this.SHOW_MESSAGE_MODAL, 3, title, desc);    // 第一个参数 3 代表脱敏业务
        } else {
          this.showSensitiveInfo();
        }

      } else {
        this.hideSensitiveInfo();
      }
    },
    showSensitiveInfo() {
      this.blockSensitiveInfo = false;
      var commonRequest = JSON.parse(sessionStorage.getItem('commonRequest'));
      commonRequest.viewType = 1;
      sessionStorage.setItem('commonRequest', JSON.stringify(commonRequest));
      this.$store.commit('SHOW_SENSITIVE_INFO');
      // this.reloadPage();
    },
    hideSensitiveInfo() {
      this.blockSensitiveInfo = true;
      var commonRequest = JSON.parse(sessionStorage.getItem('commonRequest'));
      commonRequest.viewType = 2;
      sessionStorage.setItem('commonRequest', JSON.stringify(commonRequest));
      this.$store.commit('HIDE_SENSITIVE_INFO');
      // this.reloadPage();
    },
    reloadPage() {
      // 让相应的组件重新加载，从而以新的显示方式（带着新的参数）向服务器发出请求
      let currentPath = this.$route.path;
      this.$router.push('/');
      this.$router.push(currentPath);
    },
    toggleFilterPanelDisplay() {
      Bus.$emit(this.TOGGLE_FILTER_PANEL_DISPLAY);
    },
    toggleOranizationPanelDisplay() {
      this.showOranizationPanel = !this.showOranizationPanel;
    },
    toggleAccountPanelDisplay() {
      // 按官网的说法，最好不在 methods 里面处理事件，而应该使用 v-on 的事件修饰符
      // 但是不知道为什么，我的 @click.stop 并没有阻止事件的冒泡传递
      // event.stopPropagation();
      this.showAccountPanel = !this.showAccountPanel;
    },
    hidePanels() {
      this.showOranizationPanel = false;
      this.showAccountPanel = false;
    },
    authorize() {
      this.showAccountPanel = false;
      if (this.technicalSupportAccountInfo === WAITING_TO_CHANGE) {
        // 只有网速很慢，而且用户在刚刚更新账户信息之后马上点击，才会走到这个逻辑里面，一般不会出现该情况
        this.$message({
          message: '账户信息正在更新，请稍后再试',
          type: 'warning',
          duration: 2000
        });

      } else if (this.technicalSupportAccountInfo === NEED_TO_QUERY_AGAIN) {
        this.updateAuthorizedStatus();
        this.$message({
          message: '账户信息正在更新，请稍后再试',
          type: 'warning',
          duration: 2000
        });

      } else {
        // 只有当支持员账户信息的更新过程完成之后，才打开模态框
        Bus.$emit(this.SHOW_AUTHORIZATION_MODAL, this.technicalSupportAccountInfo);
      }
    },
    updateAuthorizedStatus() {
      this.technicalSupportAccountInfo = WAITING_TO_CHANGE;
      getAuthenticationList().then((data) => {
        if (data && data.length > 0) {
          this.technicalSupportAccountInfo = data[0];
        } else {
          this.technicalSupportAccountInfo = null;
        }
      }, (error) => {
        this.technicalSupportAccountInfo = NEED_TO_QUERY_AGAIN;
        console.log(error);
      });
    },
    reselectDoctor() {
      Bus.$on(this.CONFIRM, () => {
        Bus.$off(this.CONFIRM);
        this.$router.push('/doctorSelection');
      });
      let message = '更换操作需要先退出当前医生的授权管理页，退出后需要医生重新进行手机验证才能登录，是否继续？';
      Bus.$emit(this.REQUEST_CONFIRMATION, '确认提醒', message, '确定');
    },
    setPrintTemp() {
      Bus.$emit(this.MOUNT_DYNAMIC_COMPONENT, 'printTemplateModal');
    },
    resetPassword() {
      Bus.$emit(this.MOUNT_DYNAMIC_COMPONENT, 'passwordModal', this.SHOW_PASSWORD_MODAL);
      // Bus.$emit(this.SHOW_PASSWORD_MODAL);
    },
    logout() {
      Bus.$on(this.CONFIRM, () => {
        Bus.$off(this.CONFIRM);
        sessionStorage.clear();
        this.$router.push({name: 'login'});
      });
      let message = '即将退出当前账号，是否继续？';
      Bus.$emit(this.REQUEST_CONFIRMATION, '提醒', message, '确定退出');
    },
    /**
     * 判断是否有权限查看导出模版设置
     */
    showPrintTemplate() {
      var userName = sessionStorage.getItem('userName');
      queryExportUsername().then((res) => {
        let specialUserList = res.split(',');
        // console.log(userName, specialUserList);
        if (specialUserList.indexOf(userName) >= 0 && !this.$store.state.hasRightToExport) {
          this.$store.commit('CHANGE_EXPORT_RIGHT', true);
        }
      });
    }
  },
  mounted() {
    // 一旦登录验证成功，并且进入到主界面时，就向服务器调取相应的数据，如字典项信息
    // TODO 如果在 TopBar 中改变了所属机构，就需要重新获取这些信息
    this.$store.dispatch('getWholeDictionary');
    this.$store.dispatch('getWholeTemplate');
    this.$store.dispatch('getScaleList');
    this.$store.dispatch('getExportFields');

    // 查询地理信息列表 存储在LocalStorage中
    getGeographicalList().then((data) => {
      // console.log(data);
      localStorage.setItem('geographicalList', JSON.stringify(data));
    }, (error) => {
      console.log(error);
      this.$notify.error({
        title: '错误',
        message: '获取城市列表失败！'
      });
    });

    this.updateAuthorizedStatus();
    this.showPrintTemplate();

    var commonRequest = JSON.parse(sessionStorage.getItem('commonRequest'));
    this.blockSensitiveInfo = commonRequest.viewType !== 1;
    if (this.blockSensitiveInfo) {
      this.$store.commit('HIDE_SENSITIVE_INFO');
    } else {
      this.$store.commit('SHOW_SENSITIVE_INFO');
    }

    Bus.$on(this.BLUR_ON_SCREEN, this.hidePanels);
    Bus.$on(this.PERMIT_DISPLAYING_SENSITIVE_INFO, () => {
      this.$store.commit('PERMIT_DISPLAYING_SENSITIVE_INFO');
      this.showSensitiveInfo();
    });
    Bus.$on(this.UPDATE_AUTHORIZED_STATUS, this.updateAuthorizedStatus);

    Bus.$on(this.GIVE_UP, () => {
      Bus.$off(this.CONFIRM);
    });
  },
  beforeDestroy() {
    Bus.$off(this.BLUR_ON_SCREEN);
    Bus.$off(this.PERMIT_DISPLAYING_SENSITIVE_INFO);
    Bus.$off(this.UPDATE_AUTHORIZED_STATUS);
    Bus.$off(this.CONFIRM);
    Bus.$off(this.GIVE_UP);
  }
};
</script>

<style lang="less" scoped>
@import "~styles/variables.less";
@tab-width: 100px;

.top-bar-wrapper {
  width: 100%;
  z-index: 400;
  .top-bar {
    width: 100%;
    height: @header-height;
    line-height: @header-height;
    background-color: @background-color;
    box-sizing: border-box;
    text-align: left;
    color: @font-color;
    .organization-wrapper {
      position: relative;
      display: inline-block;
      margin-left: 20px;
      font-weight: bold;
      cursor: pointer;
      &:hover {
        color: lighten(@font-color, 20%);
      }
      .name {
        line-height: @header-height;
        font-size: @large-font-size;
      }
      .iconfont {
        margin-left: 10px;
        font-size: @normal-font-size;
        color: @button-color;
      }
    }
    .switch-button {
      display: inline-block;
      position: absolute;
      left: 50%;
      top: 8px;
      width: 180px;
      height: 32px;
      transform: translateX(-90px);
      background-color: @theme-color;
      border-radius: 8px;
      text-align: center;
      .on {
        display: inline-block;
        position: absolute;
        width: 50%;
        height: 100%;
        left: 0;
        border-radius: 8px;
        background-color: @button-color;
        box-shadow: 0 0 1px @button-color;
        transition: 0.2s;
        z-index: 10;
        &.left {
          transform: translateX(0);
        }
        &.right {
          transform: translateX(90px);
        }
      }
      .text {
        display: inline-block;
        position: absolute;
        width: 50%;
        height: 32px;
        line-height: 32px;
        font-weight: bold;
        color: #fff;
        cursor: pointer;
        z-index: 20;
        &.left {
          left: 0;
        }
        &.right {
          right: 0;
        }
      }
    }
    .operation-wrapper {
      position: absolute;
      right: 0;
      top: 0;
      padding-right: 20px;
      height: @header-height;
      background-color: @background-color;
      font-size: 0;
      .iconfont {
        display: inline-block;
        margin-top: 10px;
        padding: 0 10px;
        width: 40px;
        height: 30px;
        line-height: 30px;
        border-right: 1px solid lighten(@inverse-font-color, 20%);
        font-size: 18px;
        text-align: center;
        text-decoration: none;
        outline: none;
        color: @light-font-color;
        cursor: pointer;
        &:first-child {
          border-left: 1px solid lighten(@inverse-font-color, 20%);
        }
        &:hover {
          opacity: 0.6;
        }
        &:active {
          opacity: 0.8;
        }
        &.on {
          color: @font-color;
          &:hover {
            opacity: 1;
          }
        }
      }
      .account {
        position: relative;
        display: inline-block;
        margin-left: 20px;
        cursor: pointer;
        .picture {
          position: relative;
          width: 30px;
          height: 30px;
          top: 10px;
        }
        .support-mark {
          position: absolute;
          display: inline-block;
          width: 20px;
          height: 20px;
          top: 25px;
          left: 15px;
          line-height: 20px;
          border-radius: 10px;
          box-shadow: 0 0 2px @gray-color;
          background-color: @button-color;
          color: #fff;
          font-size: @small-font-size;
          text-align: center;
        }
        .name {
          padding-left: 10px;
          font-size: @normal-font-size;
          color: @light-font-color;
          &:hover {
            opacity: 0.8;
          }
          &:active {
            opacity: 0.9;
          }
          &.on {
            color: @font-color;
            &:hover {
              opacity: 1;
            }
          }
        }
      }
    }
  }
  .shadow-border {
    position: absolute;
    width: 100%;
    height: 1px;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,0);
    box-shadow: 0 2px 3px @light-gray-color;
    z-index: 10;  // 之所以单独设定这个 shadow-border，就是为了优化阴影和弹出面板的遮挡关系
  }
  .organization-panel {
    position: absolute;
    top: @header-height;
    left: 0;
    padding: 10px 0;
    width: 700px;
    background-color: rgba(24,34,48,0.95);
    color: #fff;
    font-size: 0;
    transition: 0.3s linear 0.3s;
    z-index: -1;
    &.hide {
      color: rgba(0, 0, 0, 0);
      transform: translateY(-120%);
    }
    .item {
      display: block;
      margin: 5px 0;
      padding: 7px 10px 7px 30px;
      width: 100%;
      height: auto;
      line-height: 22px;
      box-sizing: border-box;
      text-align: left;
      font-size: @normal-font-size;
      cursor: pointer;
      &:hover {
        background-color: fade(@font-color, 80%);
      }
      &:active {
        background-color: fade(@font-color, 90%);
      }
      &.not-optional {
        cursor: default;
        &:hover, &:active {
          background-color: rgba(0, 0, 0, 0);
        }
      }
    }
    .sub-item {
      height: auto;
      padding: 7px 10px 7px 50px;
      line-height: 20px;
    }
    .seperate-line {
      margin: 5px 30px;
      width: calc(~"100%-60px");
      height: 1px;
      cursor: pointer;
      background-color: @gray-color;
    }
  }
  .account-panel {
    position: absolute;
    top: @header-height;
    right: 0;
    width: 137px;
    background-color: @theme-color;
    color: #fff;
    cursor: pointer;
    transition: 0.2s linear;
    z-index: -1;
    &.hide {
      color: rgba(0, 0, 0, 0);
      transform: translateY(-100%);
    }
    .operate-item {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 40px;
      line-height: 40px;
      text-align: center;
      cursor: pointer;
      font-size: @normal-font-size;
      &:hover {
        background-color: @font-color;
      }
      &:active {
        background-color: lighten(@font-color, 5%);
      }
    }
    .seperate-line {
      margin-left: 10px;
      width: 117px;
      height: 1px;
      cursor: pointer;
      background-color: @light-font-color;
    }
  }
}
</style>

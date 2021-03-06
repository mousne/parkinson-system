<template lang="html">
  <div class="experiment-info" v-loading="loading" element-loading-text="加载中">
    <div class="top-bar">
      <span class="title">实验流程</span>
      <span v-if="showExperimentInfo" class="info-text">
        实验方式 <span class="value experiment-mode">{{experimentModeText}}</span>
        <span v-if="hospitalType !== 2">
          治疗者 <span class="value therapist">{{therapist}}</span>
          评估者 <span class="value appraiser">{{appraiser}}</span>
        </span>
        实验编号 <span class="value experiment-number">{{experimentNumber}}</span>
      </span>
      <div class="button light-button application-button"
        v-if="listType===MY_PATIENTS_TYPE && (progressList.length===0 || preventedFromExperiment)"
        @click="clickToStartExperiment">
        开始实验
      </div>
      <div class="button light-blue-button reject-button"
        v-if="listType===MY_PATIENTS_TYPE && progressList.length>0 &&
          milestoneNum===EXPERIMENT_STEP_FILTERING && status===1"
        @click="preventFromExperiment">
        {{hospitalType === 2 ? '退回' : '排除'}}
      </div>
      <div class="button light-button agree-button"
        v-if="listType===MY_PATIENTS_TYPE && progressList.length>0 &&
          milestoneNum===EXPERIMENT_STEP_FILTERING && status===1"
        @click="joinExperiment">
        入组
      </div>
      <div class="button light-button complete-therapy-button"
        v-if="hospitalType===1 && listType===APPRAISERS_PATIENTS_TYPE && progressList.length>0 && milestoneNum===EXPERIMENT_STEP_SCREENING"
        @click="completeEvaluation">
        课题流转
      </div>
      <div class="button light-button complete-therapy-button"
        v-if="hospitalType===1 && listType===THERAPISTS_PATIENTS_TYPE && progressList.length>0 && milestoneNum===EXPERIMENT_STEP_THERAPY"
        @click="completeTherapy">
        结束治疗
      </div>
      <div class="button light-button complete-follow-up-button"
        v-if="hospitalType===1 && listType===APPRAISERS_PATIENTS_TYPE && progressList.length>0 && milestoneNum===EXPERIMENT_STEP_FOLLOW_UP"
        @click="completeFollowUp">
        本期随访结束
      </div>
      <div class="button light-button complete-follow-up-button"
        v-if="hospitalType===2 && progressList.length>0 && milestoneNum===EXPERIMENT_STEP_FOLLOW_UP &&
        getStage(progressList[progressList.length - 1]) === 7"
        @click="completeFollowUp">
        结束随访
      </div>
      <div class="button light-button complete-experiment-button"
        v-if="hospitalType===2 && progressList.length>0 && milestoneNum===EXPERIMENT_STEP_COMPLETE && !hasCompletionInfo"
        @click="completeExperiment">
        结束实验
      </div>
    </div>
    <div class="content">
      <table class="process-table">
        <tr class="row title-row">
          <td class="col col-number">序号</td>
          <td class="col col-progress">节点</td>
          <td class="col col-executor">执行人</td>
          <td class="col col-status">状态</td>
          <td class="col col-start-time">开始时间</td>
          <td class="col col-end-time">结束时间</td>
          <td class="col col-remarks">处理意见</td>
        </tr>
        <tr class="row" v-for="(step, index) in progressList">
          <td class="col col-number">{{index + 1}}</td>
          <td class="col col-progress">{{getMilestone(step, index)}}</td>
          <td class="col col-executor">{{step.executeBy ? step.executeBy : '——'}}</td>
          <td class="col col-status" :class="getStatusColor(step)">{{getStatusText(step)}}</td>
          <td class="col col-start-time">{{step.startDate ? step.startDate : '——'}}</td>
          <td class="col col-end-time">{{step.endDate}}</td>
          <td class="col col-remarks">
            {{step.remark}}
            <span class="iconfont icon-detail" @click="seeDetail(step)"
              v-if="decideIfShowDetail(step, index)"></span>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import Bus from 'utils/bus';
import { queryExperimentProgress, startExperiment, completeFollowUp } from 'api/experiment.js';

export default {
  data() {
    return {
      subjectIdForOngoingExperiment: '', // 患者当前进行中的实验所处课题ID
      progressList: [],
      status: '',
      milestoneNum: '',
      experimentMode: '',
      therapist: '',
      appraiser: '',
      doctor: '',
      currentStage: '', // 当前患者所处随访期阶段 处于随访期中才会存在此字段
      loading: false // Loading遮罩
    };
  },
  computed: {
    listType() {
      return this.$store.state.listType;
    },
    subjectId() {
      return this.$store.state.subjectId;
    },
    hospitalType() {
      return this.$store.state.hospitalType;
    },
    showExperimentInfo() {
      if (this.hospitalType === 2) {
        return this.milestoneNum > this.EXPERIMENT_STEP_FILTERING;
      } else {
        return this.milestoneNum > this.EXPERIMENT_STEP_SCREENING;
      }
    },
    notInAnyExperiment() {
      return this.subjectIdForOngoingExperiment === '';
    },
    inExperimentWithinCurrentSubject() {
      return this.subjectIdForOngoingExperiment === this.$store.state.subjectId;
    },
    inExperimentWithinOtherSubject() {
      return !this.notInAnyExperiment && this.subjectIdForOngoingExperiment !== this.$store.state.subjectId;
    },
    preventedFromExperiment() {
      var length = this.progressList.length;
      if (length > 0) {
        var theLastStep = this.progressList[length - 1];
        var status = this.getStatus(theLastStep);
        if (status === 3) {
          return true;
        }
      }
      return false;
    },
    experimentModeText() {
      if (this.experimentMode === 1) {
        return '双盲实验';
      } else {
        return '';
      }
    },
    hasCompletionInfo() {
      // 该计算变量用来判断是否有提交过结束信息
      // 判断标准是，最后一步操作里面，是否包含结束实验的描述信息 terminateExperimentModel
      var length = this.progressList.length;
      if (length > 0) {
        var theLastStep = this.progressList[length - 1];
        if (theLastStep.terminateExperimentModel) {
          return true;
        }
      }
      return false;
    }
  },
  methods: {
    clickToStartExperiment() {
      Bus.$on(this.CONFIRM, this.startExperiment);
      if (this.inExperimentWithinOtherSubject) {
        Bus.$emit(this.NOTICE, '注意', '当前患者正在其它课题下进行实验，每个患者只能同时加入一个课题的实验');
      } else {
        Bus.$emit(this.REQUEST_CONFIRMATION, '提示', '请确认患者已经签署知情同意书', '已签署', '暂未签署');
      }
    },
    startExperiment() {
      this.loading = true;
      var patientExperimentModel = {
        'patientId': this.$route.params.id,
        'tcTaskId': this.$store.state.subjectId
      };
      var experimentInfo = {
        'patientExperimentModel': patientExperimentModel
      };
      startExperiment(experimentInfo, this.hospitalType).then(() => {
        this.updateExperimentProgress();
        this.loading = false;
        Bus.$off(this.CONFIRM);

      }, (error) => {
        console.log(error);
        this.loading = false;
        Bus.$off(this.CONFIRM);
      });
    },
    joinExperiment() {
      if (this.notInAnyExperiment || this.inExperimentWithinCurrentSubject) {
        Bus.$emit(this.MOUNT_DYNAMIC_COMPONENT, 'applicationModal', this.SHOW_APPLICATION_MODAL, this.ADD_NEW_CARD, {}, true);
      } else if (this.inExperimentWithinOtherSubject) {
        Bus.$emit(this.NOTICE, '注意', '当前患者正在其它课题下进行实验，每个患者只能同时加入一个课题的实验');
      }
    },
    preventFromExperiment() {
      Bus.$emit(this.MOUNT_DYNAMIC_COMPONENT, 'rejectionModal', this.SHOW_REJECTION_MODAL, this.ADD_NEW_CARD, {}, true, this.doctor);
    },
    completeEvaluation() {
      var step = {
        // 结束基线评估，下一阶段的 phase 应当为 治疗期
        phase: '' + this.EXPERIMENT_STEP_THERAPY
      };
      Bus.$emit(this.MOUNT_DYNAMIC_COMPONENT, 'nextExperimentStepModal', this.SHOW_NEXT_EXPERIMENT_STEP_MODAL, this.ADD_NEW_CARD, step, true, this.therapist);
    },
    completeTherapy() {
      Bus.$emit(this.MOUNT_DYNAMIC_COMPONENT, 'terminationModal', this.SHOW_TERMINATION_MODAL, this.ADD_NEW_CARD, {}, true, this.appraiser);
    },
    completeFollowUp() {
      if (this.hospitalType === 2) {
        this.loading = true;
        Bus.$on(this.CONFIRM, () => {
          Bus.$off(this.CONFIRM);

          let experimentInfo = {
            patientExperimentModel: {
              patientId: this.$route.params.id,
              tcTaskId: this.subjectId
            }
          };

          completeFollowUp(experimentInfo, this.hospitalType).then(() => {
            this.updateExperimentProgress();
            this.loading = false;
          }, (error) => {
            console.log(error);
            this.loading = false;
          });
        });

        Bus.$emit(this.REQUEST_CONFIRMATION, '提示', '结束随访流程？', '是', '否');
      } else {
        Bus.$emit(this.MOUNT_DYNAMIC_COMPONENT, 'followUpTerminationModal', this.SHOW_FOLLOW_UP_TERMINATION_MODAL, this.ADD_NEW_CARD, {}, true, this.appraiser, this.currentStage);
      }
    },
    completeExperiment() {
      if (this.hospitalType === 2) {
        Bus.$emit(this.MOUNT_DYNAMIC_COMPONENT, 'endExperimentModal', this.SHOW_END_EXPERIMENT_MODAL, this.ADD_NEW_CARD, {}, true);
      }
    },
    seeDetail(step) {
      if (this.hospitalType === 2 && this.getMilestoneNum(step) === this.EXPERIMENT_STEP_COMPLETE) {
        let info = step.terminateExperimentModel ? step.terminateExperimentModel : {};
        Bus.$emit(this.MOUNT_DYNAMIC_COMPONENT, 'endExperimentModal', this.SHOW_END_EXPERIMENT_MODAL, this.VIEW_CURRENT_CARD, info, false);
      } else {
        Bus.$emit(this.MOUNT_DYNAMIC_COMPONENT, 'experimentStepModal', this.SHOW_EXPERIMENT_STEP_MODAL, this.VIEW_CURRENT_CARD, step, false);
      }
    },
    getMilestoneNum(step) {
      var milestoneNum = 0;
      var phase = step.phase;
      if (phase && phase.split('.').length > 0) {
        milestoneNum = Number(phase.split('.')[0]);
      }
      milestoneNum = parseInt(milestoneNum, 10);
      return milestoneNum;
    },
    getMilestone(step, currentIndex) {
      var milestoneNum = this.getMilestoneNum(step);

      // 因为存在多个随访期，所以需要知道到底是第几个随访期
      if (milestoneNum === this.EXPERIMENT_STEP_FOLLOW_UP) {
        var count = 0;
        for (var i = 0; i <= currentIndex; i++) {
          if (this.getMilestoneNum(this.progressList[i]) === this.EXPERIMENT_STEP_FOLLOW_UP) {
            count += 1;
          }
        }
      }

      var resultText = '';
      switch (milestoneNum) {
        case this.EXPERIMENT_STEP_FILTERING:
          if (this.hospitalType === 1) {
            resultText = '入组诊断';
          } else if (this.hospitalType === 2) {
            resultText = '筛选入组(V0)';
          }
          break;
        case this.EXPERIMENT_STEP_SCREENING:
          resultText = '基线评估';
          if (this.hospitalType === 2) {
            resultText += '(V1)';
          }
          break;
        case this.EXPERIMENT_STEP_THERAPY:
          resultText = '治疗期';
          break;
        case this.EXPERIMENT_STEP_FOLLOW_UP:
          if (this.hospitalType === 1) {
            resultText = '随访期' + '(' + count + ')';
          } else if (this.hospitalType === 2) {
            let subNum = this.getStage(step);
            resultText = '随访期(V' + subNum + ')';
          }

          break;
        case this.EXPERIMENT_STEP_COMPLETE:
          resultText = '实验结束';
          if (this.hospitalType === 2) {
            resultText += '(V8)';
          }
          break;
        default:
          break;
      }

      return resultText;
    },
    getStatus(step) {
      var phase = step.phase;
      if (phase) {
        var status = phase.split('.')[1];
        if (status !== undefined) {
          return Number(status);
        }
      }
      return '';
    },
    getStage(step) {
      var stage = step.stage;
      if (stage) {
        return Number(stage);
      }
      return '';
    },
    getStatusText(step) {
      var status = this.getStatus(step);
      if (status === 0) {
        return '等待揭盲';
      } else if (status === 1) {
        return '进行中';
      } else if (status === 2) {
        return '完成';
      } else if (status === 3) {
        return '排除患者';
      }
    },
    getStatusColor(step) {
      var status = this.getStatus(step);
      if (status === 0) {
        return 'waiting';
      } else if (status === 1) {
        return 'ongoing';
      } else if (status === 2) {
        return 'finished';
      } else if (status === 3) {
        return 'rejected';
      }
    },
    decideIfShowDetail(step, index) {
      if (index < this.progressList.length - 1) {
        return true;
      } else if (this.getMilestoneNum(step) === this.EXPERIMENT_STEP_SCREENING && this.getStatus(step) === 3) {
        return true;
      } else if (this.getMilestoneNum(step) === this.EXPERIMENT_STEP_COMPLETE &&
        this.hospitalType === 2 && this.hasCompletionInfo) {
        return true;
      }
      return false;
    },
    updateExperimentProgress() {
      var experimentInfo = {
        'patientExperimentModel': {
          'patientId': this.$route.params.id,
          'tcTaskId': this.subjectId
        }
      };
      queryExperimentProgress(experimentInfo).then((data) => {
        // console.log(data);
        this.subjectIdForOngoingExperiment = data && data.patientCurrentTaskId ? data.patientCurrentTaskId : '';
        if (data && data.patientExperiment && data.patientExperiment.length > 0) {
          this.progressList = data.patientExperiment;
        } else {
          this.progressList = [];
        }
        var currentPhase = data.status ? data.status : '';
        var status = currentPhase.split('.')[1] ? currentPhase.split('.')[1] : 0;
        var milestoneNum = currentPhase.split('.')[0] ? currentPhase.split('.')[0] : 0;
        this.status = Number(status);
        this.milestoneNum = Number(milestoneNum);
        this.experimentMode = data.taskMode ? data.taskMode : 1;
        this.therapist = data.treater ? data.treater : '';
        this.appraiser = data.assessor ? data.assessor : '';
        this.doctor = data.doctor ? data.doctor : '';
        this.experimentNumber = data.taskCode ? data.taskCode : '';
        this.currentStage = data.stage ? data.stage : '';

        Bus.$emit(this.SCROLL_AREA_SIZE_CHANGE);

        // 下面这两个事件会相应地更新其它模块下的实验信息
        Bus.$emit(this.UPDATE_PATIENTS_LIST);
        Bus.$emit(this.UPDATE_PATIENT_INFO);

      }, (error) => {
        console.log(error);
      });
    }
  },
  mounted() {
    Bus.$on(this.UPDATE_EXPERIMENT_INFO, this.updateExperimentProgress);
    this.updateExperimentProgress();

    // 如果是由课题流转模态框点击“结束随访”跳转过来的，则自动打开结束实验的模态框
    if (this.$route.params.shouldOpenEndExperimentModal) {
      this.completeExperiment();
    }
  },
  beforeRouteEnter(to, from, next) {
    var subjectId = sessionStorage.getItem('subjectId');
    if (subjectId > 0) {
      next();
    } else {
      next(from.path);
    }
  },
  beforeDestroy() {
    Bus.$off(this.UPDATE_EXPERIMENT_INFO);
    Bus.$off(this.CONFIRM);
  }
};
</script>

<style lang="less">
@import "~styles/variables.less";

.experiment-info {
  box-sizing: content-box;
  background-color: @screen-color;
  .top-bar {
    width: 100%;
    height: 40px;
    margin-bottom: 5px;
    padding-left: 20px;
    box-sizing: border-box;
    text-align: left;
    background-color: @background-color;
    .title {
      display: inline-block;
      height: 40px;
      line-height: 40px;
      font-size: @large-font-size;
      font-weight: bold;
    }
    .info-text {
      margin-left: 20px;
      .value {
        margin-left: 5px;
        margin-right: 10px;
      }
      .experiment-mode {
        color: @light-font-color;
      }
      .therapist, .appraiser {
        color: @button-color;
      }
      .experiment-number {
        color: @green-color;
      }
    }
    .button {
      position: absolute;
      top: 6px;
      width: @small-button-width;
      height: @small-button-height;
      line-height: @small-button-height;
      font-size: @normal-font-size;
      text-align: center;
      cursor: pointer;
      color: #fff;
      &:hover {
        opacity: 0.6;
      }
      &:active {
        opacity: 0.8;
      }
      &.light-button {
        background-color: @button-color;
      }
      &.light-blue-button {
        background-color: @light-font-color;
      }
      &.application-button {
        right: 10px;
      }
      &.reject-button {
        right: 30px + @small-button-width;
      }
      &.agree-button {
        right: 10px;
      }
      &.complete-therapy-button {
        right: 10px;
      }
      &.complete-follow-up-button {
        right: 10px;
        width: 100px;
      }
      &.complete-experiment-button {
        right: 10px;
        width: 100px;
      }
    }
  }
  .content {
    width: 100%;
    background-color: @background-color;
    .process-table {
      width: 100%;
      border-spacing: 0;
      table-layout: fixed;
      // border: 1px solid @light-gray-color;
      border-collapse: collapse;
      .row {
        width: 100%;
        height: 35px;
        line-height: 35px;
        &.title-row {
          background-color: @light-font-color;
          color: #fff;
        }
        .col {
          padding: 0 3px;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
          &.col-number {
            width: 10%;
          }
          &.col-progress {
            width: 15%;
          }
          &.col-executor {
            width: 15%;
          }
          &.col-status {
            width: 15%;
          }
          &.col-start-time {
            width: 20%;
          }
          &.col-end-time {
            width: 20%;
          }
          &.col-remarks {
            position: relative;
            width: 30%;
            padding-right: 15px;
            .iconfont {
              position: absolute;
              top: 1px;
              right: 3px;
              font-size: @normal-font-size;
              // font-weight: bold;
              cursor: pointer;
              &:hover {
                opacity: 0.6;
              }
              &:active {
                opacity: 0.8;
              }
            }
          }
          &.waiting {
            color: @light-font-color;
          }
          &.ongoing {
            color: @green-color;
          }
          &.finished {
            color: @font-color;
          }
          &.rejected {
            color: @alert-color;
          }
        }
      }
    }
  }
}
</style>

<template lang="html">
  <div class="symptoms-modal-wrapper">
    <div class="symptoms-modal">
      <h3 class="title">{{title}}</h3>
      <i class="el-alert__closebtn el-icon-close large-icon" @click="cancel"></i>
      <div class="modal-body">
      <div class="content">
        <!-- 以下是 运动症状才有的序列 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ -->
          <div class="field">
            <span class="field-name long-field-name">
              症状名称:
              <span class="required-mark">*</span>
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{transformII(copyInfo.symName, getSymOptions(copyInfo.symType))}}</span>
            </span>
            <span class="field-input" v-else>
              <span class="warning-text">{{warningResults.symName}}</span>
              <el-select v-model="copyInfo.symName" placeholder="请选择症状名称" clearable
               @change="getMedicalType()" :class="{'warning': warningResults.symName}" >
                <el-option
                 v-for="item in allSymptoms"
                 :key="item.sortId"
                 :label="item.getAllSymptomsName"
                 :value="item.sortId"></el-option>
              </el-select>
            </span>
          </div>
          <div class="field">
            <span class="field-name long-field-name">
              症状类型:
              <span class="required-mark">*</span>
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{transformII(copyInfo.symType,  getOptions('SympType'))}}</span>
            </span>
            <span class="field-input" v-else>
              <span class="warning-text">{{warningResults.symType}}</span>
              <el-select v-model="copyInfo.symType" placeholder="请选择首发症状类型" clearable
              @change="updateWarning('symType'),clearVal(['symType'])" :class="{'warning': warningResults.symType}" >
                <el-option
                  v-for="item in getOptions('SympType')"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code">
                </el-option>
              </el-select>
            </span>
          </div>

          <div class="field" v-show="copyInfo.symType===0">
            <span class="field-name long-field-name">
              左上肢出现时间:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{copyInfo.ariseTimeLeftUp}}</span>
            </span>
            <span class="field-input" v-else>
              <!-- <span class="warning-text">必填项</span> -->
              <el-date-picker v-model="copyInfo.ariseTimeLeftUp" type="date" placeholder="请选择左上肢出现时间" clearable
               :picker-options="pickerOptions">
              </el-date-picker>
            </span>
          </div>

          <div class="field" v-show="copyInfo.symType===0">
            <span class="field-name long-field-name">
              右上肢出现时间:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{copyInfo.ariseTimeRightUp}}</span>
            </span>
            <span class="field-input" v-else>
              <!-- <span class="warning-text">必填项</span> -->
              <el-date-picker v-model="copyInfo.ariseTimeRightUp" type="date" placeholder="请选择右上肢出现时间" clearable
               :picker-options="pickerOptions">
              </el-date-picker>
            </span>
          </div>

          <div class="field" v-show="copyInfo.symType===0">
            <span class="field-name long-field-name">
              左下肢出现时间:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{copyInfo.ariseTimeLeftDown}}</span>
            </span>
            <span class="field-input" v-else>
              <!-- <span class="warning-text">必填项</span> -->
              <el-date-picker v-model="copyInfo.ariseTimeLeftDown" type="date" placeholder="请选择左下肢出现时间" clearable
               :picker-options="pickerOptions">
              </el-date-picker>
            </span>
          </div>

          <div class="field" v-show="copyInfo.symType===0">
            <span class="field-name long-field-name">
              右下肢出现时间:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{copyInfo.ariseTimeRightDown}}</span>
            </span>
            <span class="field-input" v-else>
              <!-- <span class="warning-text">必填项</span> -->
              <el-date-picker v-model="copyInfo.ariseTimeRightDown" type="date" placeholder="请选择右下肢出现时间" clearable
               :picker-options="pickerOptions">
              </el-date-picker>
            </span>
          </div>

          <div class="field" v-show="copyInfo.symType===0">
            <span class="field-name long-field-name">
              是否规律出现:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{transform(copyInfo.whetherLaw, 'digitYN')}}</span>
            </span>
            <span class="field-input" v-else>
              <el-select v-model="copyInfo.whetherLaw" placeholder="请选择是否规律出现" clearable >
                <el-option
                 v-for="item in getOptions('digitYN')"
                 :key="item.code"
                 :label="item.name"
                 :value="item.code">
                </el-option>
            </el-select>
            </span>
          </div>

          <div class="field" v-show="copyInfo.symType===0">
            <span class="field-name long-field-name">
              备注:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{copyInfo.remarks}}</span>
            </span>
            <span class="field-input" v-else>
              <!-- <span class="warning-text">必填项</span> -->
              <el-input v-model="copyInfo.remarks" type="textarea" placeholder="请输入备注" :maxlength="500"></el-input>
            </span>
          </div>

        <!-- 以上是 运动症状才有的序列 ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ -->


        <!-- 以下是 运动并发症才有的序列 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ -->

          <!-- <div class="field">
            <span class="field-name long-field-name">
              症状名称:
              <span class="required-mark">*</span>
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{transformII(copyInfo.symName, getSymOptions(copyInfo.symType))}}</span>
            </span>
            <span class="field-input" v-else>
              <span class="warning-text">{{warningResults.symName}}</span>
              <el-select v-model="copyInfo.symName" placeholder="请选择症状名称" clearable
               @change="updateWarning('symName')" :class="{'warning': warningResults.symName}" >
                <el-option
                 v-for="item in getSymOptions(copyInfo.symType)"
                 :key="item.code"
                 :label="item.name"
                 :value="item.code">
                </el-option>
              </el-select>
            </span>
          </div> -->

          <div class="field" v-show="copyInfo.symType===1">
            <span class="field-name long-field-name">
              出现时间:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{copyInfo.ariseTime}}</span>
            </span>
            <span class="field-input" v-else>
              <!-- <span class="warning-text">必填项</span> -->
              <el-date-picker v-model="copyInfo.ariseTime" type="date" placeholder="请选择出现时间" clearable
               :picker-options="pickerOptions">
              </el-date-picker>
            </span>
          </div>

          <div class="field" v-show="copyInfo.symType===1">
            <span class="field-name long-field-name">
              是否规律出现:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{transform(copyInfo.whetherLaw, 'digitYN')}}</span>
            </span>
            <span class="field-input" v-else>
              <!-- <span class="warning-text">必填项</span> -->
              <el-select v-model="copyInfo.whetherLaw" placeholder="请选择是否规律出现" clearable >
                <el-option
                 v-for="item in getOptions('digitYN')"
                 :key="item.code"
                 :label="item.name"
                 :value="item.code">
                </el-option>
              </el-select>
            </span>
          </div>

          <div class="field" v-show="copyInfo.symType===1">
            <span class="field-name long-field-name">
              持续时长（小时/天）:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{copyInfo.lastTime}}</span>
            </span>
            <span class="field-input" v-else>
              <!-- <span class="warning-text">必填项</span> -->
              <el-input v-model="copyInfo.lastTime" placeholder="请输入持续时长"></el-input>
            </span>
          </div>

          <div class="field" v-show="copyInfo.symType===1">
            <span class="field-name long-field-name">
              备注:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{copyInfo.remarks}}</span>
            </span>
            <span class="field-input" v-else>
              <!-- <span class="warning-text">必填项</span> -->
              <el-input v-model="copyInfo.remarks" type="textarea" placeholder="请输入备注" :maxlength="500"></el-input>
            </span>
          </div>

        <!-- 以上是 运动并发症才有的序列 ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ -->

        <!-- 以下是 非运动症状才有的序列 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ -->


          <div class="field" v-show="copyInfo.symType===2">
            <span class="field-name long-field-name">
              非运动症状类型:
              <span class="required-mark">*</span>
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{transform(copyInfo.notSportTypeId, 'noSportSymType')}}</span>
            </span>
            <span class="field-input" v-else>
              <span class="warning-text">{{warningResults.notSportTypeId}}</span>
              <el-select v-model="copyInfo.notSportTypeId" placeholder="请选择非运动症状类型" clearable
               @change="updateWarning('notSportTypeId')" :class="{'warning': warningResults.notSportTypeId}" >
                <el-option
                 v-for="item in getOptions('noSportSymType')"
                 :key="item.code"
                 :label="item.name"
                 :value="item.code">
                </el-option>
              </el-select>
            </span>
          </div>

          <!-- <div class="field" v-show="copyInfo.symType===2">
            <span class="field-name long-field-name">
              症状名称:
              <span class="required-mark">*</span>
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{copyInfo.symName}}</span>
              <span>{{transformII(copyInfo.symName, getNoSportOptions(copyInfo.notSportTypeId))}}</span>
            </span>
            <span class="field-input" v-else>
              <span class="warning-text">{{warningResults.symName}}</span>
              <el-select v-model="copyInfo.symName" placeholder="请选择症状名称" clearable
               @change="updateWarning('symName')" :class="{'warning': warningResults.symName}" >
                <el-option
                 v-for="item in getNoSportOptions(copyInfo.notSportTypeId)"
                 :key="item.code"
                 :label="item.name"
                 :value="item.code">
                </el-option>
              </el-select>
            </span>
          </div> -->

          <div class="field" v-show="copyInfo.symType===2">
            <span class="field-name long-field-name">
              出现时间:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{copyInfo.ariseTime}}</span>
            </span>
            <span class="field-input" v-else>
              <!-- <span class="warning-text">必填项</span> -->
              <el-date-picker v-model="copyInfo.ariseTime" type="date" placeholder="请选择出现时间" clearable
               :picker-options="pickerOptions">
              </el-date-picker>
            </span>
          </div>

          <div class="field" v-show="copyInfo.symType===2">
            <span class="field-name long-field-name">
              是否规律出现:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{transform(copyInfo.whetherLaw, 'digitYN')}}</span>
            </span>
            <span class="field-input" v-else>
              <!-- <span class="warning-text">必填项</span> -->
              <el-select v-model="copyInfo.whetherLaw" placeholder="请选择是否规律出现" clearable >
                <el-option
                 v-for="item in getOptions('digitYN')"
                 :key="item.code"
                 :label="item.name"
                 :value="item.code">
                </el-option>
              </el-select>
            </span>
          </div>

          <div class="field" v-show="copyInfo.symType===2">
            <span class="field-name long-field-name">
              备注:
              <!-- <span class="required-mark">*</span> -->
            </span>
            <span class="field-input long-field-name" v-if="mode===VIEW_CURRENT_CARD">
              <span>{{copyInfo.remarks}}</span>
            </span>
            <span class="field-input" v-else>
              <!-- <span class="warning-text">必填项</span> -->
              <el-input v-model="copyInfo.remarks" type="textarea" placeholder="请输入备注" :maxlength="500"></el-input>
            </span>
          </div>

        <!-- 以上是 非运动症状才有的序列 ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ -->

      </div>

      <div class="seperate-line" v-show="true"></div>



      </div>
      <div class="modal-footer">
      <div class="button cancel-button" @click="cancel">取消</div>
      <div v-show="mode!==VIEW_CURRENT_CARD" class="button submit-button" @click="submit">确定</div>
      <div v-show="mode===VIEW_CURRENT_CARD && showEdit" class="button edit-button" @click="switchToEditingMode">编辑</div>
      </div>
    </div>
  </div>
</template>

<script>
import Bus from 'utils/bus.js';
import Ps from 'perfect-scrollbar';
import { mapGetters } from 'vuex';
import Util from 'utils/util.js';
import { reviseDateFormat, pruneObj } from 'utils/helper.js';
import { addPatientSymptom, modPatientSymptom} from 'api/patient.js';
export default {
  data() {
    return {
      mode: '',
      completeInit: false,
      copyInfo: {
        symType: '', //  首发症状类型 string
        symName: '', // 症状名称 string
        ariseTimeLeftDown: '', // 左下肢出现时间
        ariseTimeLeftUp: '', // 左上肢出现时间
        ariseTimeRightDown: '', // 右下肢出现时间
        ariseTimeRightUp: '', // 右上肢出现时间
        whetherLaw: '',
        remarks: '',
        ariseTime: '', // 出现时间
        lastTime: '', // 持续时间
        notSportTypeId: '' // 非运动症状类型
      },
      id: '',
      warningResults: {
        symType: '',
        symName: '',
        notSportTypeId: ''
      },
      runClearVal: true, // 是否执行clearVal方法中的置空copyInfo操作
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      lockSubmitButton: false,
      showEdit: false
    };
  },
  computed: {
    ...mapGetters([
      'typeGroup',
      'symptomType',
      'noSportType'
    ]),
    title() {
      if (this.mode === this.ADD_NEW_CARD) {
        return '新增主诉症状';
      } else {
        return '主诉症状';
      }
    },
    verificationFieldList() {
      if (this.copyInfo.symType === 0 || this.copyInfo.symType === 1 || this.copyInfo.symType === 2 || this.copyInfo.symType === 3) {
        return ['symType', 'symName'];
      }
    }
  },
  methods: {
    // clearVal(fieldName) {
    //   for (let key in this.copyInfo) {
    //     if (fieldName.indexOf(key) === -1 && this.runClearVal) {
    //       this.$set(this.copyInfo, key, '');
    //     };
    //   };
    //   this.$nextTick(() => {
    //     for (var property in this.warningResults) {
    //       if (this.warningResults.hasOwnProperty(property)) {
    //         this.warningResults[property] = '';
    //       }
    //     }
    //   });
    // },
    showModal(cardOperation, item, showEdit) {
      this.completeInit = false;
      this.runClearVal = false;
      this.mode = cardOperation;
      this.showEdit = showEdit;
      // ******************************
      this.$set(this.copyInfo, 'symType', item.symType);
      this.$set(this.copyInfo, 'symName', item.symName);
      this.$set(this.copyInfo, 'ariseTimeLeftDown', item.ariseTimeLeftDown);
      this.$set(this.copyInfo, 'ariseTimeLeftUp', item.ariseTimeLeftUp);
      this.$set(this.copyInfo, 'ariseTimeRightDown', item.ariseTimeRightDown);
      this.$set(this.copyInfo, 'ariseTimeRightUp', item.ariseTimeRightUp);
      this.$set(this.copyInfo, 'whetherLaw', item.whetherLaw);
      this.$set(this.copyInfo, 'remarks', item.remarks);
      this.$set(this.copyInfo, 'ariseTime', item.ariseTime);
      this.$set(this.copyInfo, 'lastTime', item.lastTime);
      this.$set(this.copyInfo, 'notSportTypeId', item.notSportTypeId);
      // ---------
      this.id = item.id;
      // ********************************

      if (this.mode === this.ADD_NEW_CARD) {
        for (let key in this.copyInfo) {
          this.$set(this.copyInfo, key, '');
        };
      };

      this.$nextTick(() => {
        for (var property in this.warningResults) {
          if (this.warningResults.hasOwnProperty(property)) {
            this.warningResults[property] = '';
          }
        }
      });
      this.completeInit = true;
      this.updateScrollbar();
      this.$nextTick(() => {
        this.runClearVal = true;
      });
    },
    updateScrollbar() {
      this.$nextTick(() => {
        if (this.$refs.scrollArea) {
          Ps.destroy(this.$refs.scrollArea);
          Ps.initialize(this.$refs.scrollArea, {
            wheelSpeed: 1,
            minScrollbarLength: 40
          });
        }
      });
    },
    transName(i, fieldName) {
      // transName(0, 'SympType')
      // 本来是在改变首发症状类型时，作比较用，但select顺序一变，就错了，暂时先直接比汉字了
      if (this.getOptions(fieldName)[i] === undefined) {
        return -1;
      } else {
        return this.getOptions(fieldName)[i].name;
      }
    },
    transId(str, fieldName) {
      var obj = this.getOptions(fieldName).filter((item) => {return str === item.name;})[0];
      if (obj) {
        return obj.code;
      } else {
        return '';
      }
    },
    transformII(id, arr) {
      arr = arr ? arr : [];
      return arr.filter((obj) => {
        return (parseInt(obj.typeCode, 10) || parseInt(obj.code, 10)) === id;
      }).map((obj) => {
        return (obj.typeName || obj.name);
      })[0];
    },
    transform(id, fieldName) {
      id = parseInt(id, 10);
      let typesArr = this.getOptions(fieldName);
      let item = Util.getElement('code', id, typesArr);
      return item.name ? item.name : '';
    },
    getOptions(fieldName) {
      var options = [];
      var types = Util.getElement('typegroupcode', fieldName, this.typeGroup).types;
      types = types ? types : [];
      for (let type of types) {
        options.push({
          name: type.typeName,
          code: type.typeCode
        });
      };
      return options;
    },
    getSymOptions(fieldType) {
      return this.symptomType.filter((obj) => {
        return obj.symptomtype === fieldType;
      }).map((obj) => {
        return {
          name: obj.sympName,
          code: obj.id
        };
      });
    },
    getNoSportOptions(fieldType) {
      let noSportArr = this.noSportType.filter((obj) => {
        return obj.noSportType === fieldType;
      }).map((obj) => {
        return {
          name: obj.noSportName,
          code: obj.id
        };
      });
      // 特殊要求：如果select列表只有一项自动把这一项显示出来
      if (noSportArr.length === 1) {
        this.$set(this.copyInfo, 'symName', noSportArr[0].code);
      }
      return noSportArr;
    },
    updateWarning(fieldName) {
      if (this.completeInit && (this.copyInfo[fieldName] === undefined || this.copyInfo[fieldName] === '')) {
        this.warningResults[fieldName] = '必填项';
      } else {
        this.warningResults[fieldName] = '';
      }
    },
    cancel() {
      this.lockSubmitButton = false;
      Bus.$emit(this.UNLOAD_DYNAMIC_COMPONENT);
    },
    switchToEditingMode() {
      this.mode = this.EDIT_CURRENT_CARD;
      this.updateScrollbar();
    },
    submit() {
      if (this.lockSubmitButton) {
        return;
      }
      this.lockSubmitButton = true;

      // 验证必填项 如果没填显示红框，显示必填项三个字
      for (let property in this.warningResults) {
        if (this.verificationFieldList.indexOf(property) >= 0 && this.warningResults.hasOwnProperty(property)) {
          this.updateWarning(property);
        }
      };
      // 如果显示了必填项三个字，说明验证没通过，就将确定按钮锁住，并退出
      for (let property in this.warningResults) {
        if (this.warningResults.hasOwnProperty(property) && this.warningResults[property]) {
          this.lockSubmitButton = false;
          return;
        }
      };

      // 验证完成，准备请求数据
      var ComplaintsInfo = Object.assign({}, this.copyInfo); // 主诉症状数据
      ComplaintsInfo.patientId = this.$route.params.id;
      ComplaintsInfo.patientCaseId = this.$route.params.caseId;

      reviseDateFormat(ComplaintsInfo);
      pruneObj(ComplaintsInfo);

      if (this.mode === this.ADD_NEW_CARD) {
        addPatientSymptom(ComplaintsInfo).then(() => {
          this.updateAndClose();
          this.lockSubmitButton = false;
        }, this._handleError);
      } else if (this.mode === this.EDIT_CURRENT_CARD) {
        ComplaintsInfo.id = this.id;
        modPatientSymptom(ComplaintsInfo).then(() => {
          this.updateAndClose();
          this.lockSubmitButton = false;
        }, this._handleError);
      };

    },
    _handleError(error) {
      console.log(error);
      this.lockSubmitButton = false;
    },
    updateAndClose() {
      Bus.$emit(this.UPDATE_COMPLAINTSYMPTOMS_INFO);

      Bus.$emit(this.UNLOAD_DYNAMIC_COMPONENT);
    }
  },
  mounted() {
    // 先在本组件注册该事件，等待Layout组件接收动态组件挂载完毕的通知，再在本组件执行 showPanel 或 showModal
    Bus.$on(this.SHOW_CHIEF_COMPLAINT_SYMPTOMS_MODAL, this.showModal);

    // 动态组件挂载完毕，通知Layout组件，动态组件已挂载完毕
    Bus.$emit(this.DYNAMIC_COMPONENT_MOUNTED);
  },
  watch: {
    '$route.path'() {
      this.cancel();
    }
  }
};
</script>

<style lang="less">
@import "~styles/variables.less";

@field-line-height: 25px;
@field-name-width: 90px;
@long-field-name-width: 160px;

.symptoms-modal-wrapper{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: fadeout(@light-font-color, 30%);
  z-index: 500;
  .symptoms-modal{
    position: relative;
    margin: auto;
    top: 3%;
    width: 660px;
    max-height: 94%;
    background-color: @background-color;
    overflow: hidden;
    .title {
      padding: 30px 0 10px;
      font-size: @large-font-size;
    }
    .large-icon {
      font-size: @large-font-size;
    }
    .modal-body {
      position: relative;
      max-height: 80%;
      overflow-y: auto;
      padding: 0 30px;
      overflow-x: hidden;
    }

    .modal-footer {
      position: relative;
      bottom: 0px;
    }

    .content{
      text-align: left;
      font-size: 0;
      .field {
        display: inline-block;
        position: relative;
        width: 100%;
        min-height: 45px;
        box-sizing: border-box;
        text-align: left;
        vertical-align: top;
        transform: translateX(10px); // 这一行是为了修补视觉上的偏移
        &.half-line {
          width: 50%;
          .field-input {
            width: calc(~"92% - @{field-name-width}");
          }
        }
        .field-name {
          display: inline-block;
          position: absolute;
          top: 0;
          left: 0;
          width: @field-name-width;
          line-height: @field-line-height;
          font-size: @normal-font-size;
          color: @font-color;
          &.long-field-name {
            width: @long-field-name-width;
          }
          .required-mark {
            color: red;
            font-size: 20px;
            vertical-align: middle;
          }
        }
        .field-input {
          display: inline-block;
          position: relative;
          top: 0;
          left: @long-field-name-width;
          width: calc(~"96% - @{long-field-name-width}");
          line-height: @field-line-height;
          font-size: @normal-font-size;
          color: @light-font-color;
          &.long-field-name {
            left: @long-field-name-width;
          }
          .warning-text {
            position: absolute;
            top: 22px;
            left: 10px;
            height: 15px;
            color: red;
            font-size: @small-font-size;
          }
          .el-input {
            transform: translateY(-3px);
            .el-input__inner {
              height: 30px;
              border: none;
              background-color: @screen-color;
            }
          }
          .el-select {
            width: 100%;
          }
          .el-date-editor {
            width: 100%;
          }
          .el-textarea {
            margin-bottom: 15px;
            transform: translateY(-3px);
            .el-textarea__inner {
              border: none;
              background-color: @screen-color;
            }
          }
          .el-select {
            width: 100%;
          }
          .el-date-editor {
            width: 100%;
          }
          .warning .el-input__inner,
          .warning .el-textarea__inner {
            border: 1px solid red;
          }
        }
      }
    }
    .seperate-line {
      width: 90%;
      height: 1px;
      margin: 15px auto 10px;
      background-color: @light-gray-color;
    }
    .button {
      display: inline-block;
      width: 100px;
      margin: 10px 20px 20px 20px;
      height: 30px;
      line-height: 30px;
      color: #fff;
      cursor: pointer;
      &.cancel-button {
        background-color: @light-font-color;
      }
      &.submit-button, &.edit-button {
        background-color: @button-color;
       }
      &:hover {
        opacity: 0.8;
      }
      &:active {
        opacity: 0.9;
      }
    }
    .ps__scrollbar-y-rail {
      position: absolute;
      width: 15px;
      right: 0;
      padding: 0 3px;
      box-sizing: border-box;
      opacity: 0.3;
      transition: opacity 0.3s, padding 0.2s;
      .ps__scrollbar-y {
        position: relative;
        background-color: #aaa;
        border-radius: 20px;
      }
    }
    &:hover {
      .ps__scrollbar-y-rail {
        opacity: 0.6;
        &:hover {
          padding: 0;
        }
      }
    }
  }
}
</style>


<template>
  <div>
    <t-form>
      <t-form-item label="禁用">
        <t-input-number v-model="value0" disabled></t-input-number>
      </t-form-item>
      <t-form-item label="只读">
        <t-input-number v-model="value1" readonly></t-input-number>
      </t-form-item>
      <t-form-item label="正常">
        <t-input-number v-model="value2"></t-input-number>
      </t-form-item>
      <t-form-item label="成功">
        <t-input-number v-model="value3" status="success"></t-input-number>
      </t-form-item>
      <t-form-item label="警告">
        <t-input-number v-model="value4" status="warning"></t-input-number>
      </t-form-item>
      <t-form-item label="错误">
        <t-input-number v-model="value5" status="error"></t-input-number>
      </t-form-item>
      <t-form-item label="正常提示">
        <t-input-number v-model="value6" tips="这是普通文本提示"></t-input-number>
      </t-form-item>
      <t-form-item label="成功提示">
        <t-input-number v-model="value7" status="success" tips="校验通过文本提示"></t-input-number>
      </t-form-item>
      <t-form-item label="警告提示">
        <t-input-number v-model="value8" status="warning" tips="校验不通过文本提示"></t-input-number>
      </t-form-item>
      <t-form-item label="错误提示">
        <t-input-number v-model="value9" status="error" tips="校验存在严重问题文本提示"></t-input-number>
      </t-form-item>
    </t-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      value0: 3,
      value1: 3,
      value2: 3,
      value3: 3,
      value4: 3,
      value5: 3,
      value6: 3,
      value7: 3,
      value8: 3,
      value9: 3,
    };
  },
};
</script>
<style scoped>
.t-form__item {
  margin-bottom: 0px;
}

.t-input-number {
  width: 300px;
}
.tdesign-demo-item--input-number .t-input-number {
  margin-bottom: 16px;
}
</style>

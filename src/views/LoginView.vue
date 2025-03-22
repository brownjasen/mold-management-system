<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="login-header">
          <h2>{{ isLogin ? '登录' : '注册' }}</h2>
          <el-switch
              v-model="isLogin"
              active-text="登录"
              inactive-text="注册"
              :active-value="true"
              :inactive-value="false"
          />
        </div>
      </template>

      <el-form
          :model="formData"
          :rules="formRules"
          ref="formRef"
          label-position="top"
          @submit.prevent="handleSubmit"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password
          />
        </el-form-item>

        <!-- 注册时的额外字段 -->
        <template v-if="!isLogin">
          <!-- 确认密码 -->
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
                v-model="formData.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                prefix-icon="el-icon-lock"
                show-password
            />
          </el-form-item>

          <!-- 姓名 -->
          <el-form-item label="姓名" prop="name">
            <el-input
                v-model="formData.name"
                placeholder="请输入您的姓名"
                prefix-icon="el-icon-user"
            />
          </el-form-item>

          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input
                v-model="formData.email"
                placeholder="请输入邮箱地址"
                prefix-icon="el-icon-message"
            />
          </el-form-item>
        </template>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              class="submit-button"
          >
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
        </el-form-item>

        <!-- 切换登录/注册 -->
        <div class="form-footer">
          <el-link
              type="primary"
              @click="isLogin = !isLogin"
          >
            {{ isLogin ? '没有账号？点击注册' : '已有账号？点击登录' }}
          </el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import authStore from '@/store/auth';

export default {
  setup() {
    const isLogin = ref(true);
    const loading = ref(false);
    const router = useRouter();
    const formRef = ref(null);

    // 表单数据
    const formData = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      email: ''
    });

    // 表单验证规则
    const formRules = computed(() => {
      const rules = {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
        ]
      };

      // 注册时的额外验证规则
      if (!isLogin.value) {
        rules.confirmPassword = [
          { required: true, message: '请确认密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== formData.password) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ];

        rules.name = [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ];

        rules.email = [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
        ];
      }

      return rules;
    });

    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return;

      try {
        // 表单验证
        await formRef.value.validate();

        loading.value = true;

        if (isLogin.value) {
          // 登录
          await authStore.login(formData.username, formData.password);
          ElMessage.success('登录成功');
          router.push('/');
        } else {
          // 注册
          const userData = {
            username: formData.username,
            password: formData.password,
            name: formData.name,
            email: formData.email
          };

          await authStore.register(userData);
          ElMessage.success('注册成功，请登录');
          isLogin.value = true;

          // 清空表单
          formData.password = '';
          formData.confirmPassword = '';
          formData.name = '';
          formData.email = '';
        }
      } catch (error) {
        console.error('表单提交错误:', error);
        ElMessage.error(error.message || (isLogin.value ? '登录失败' : '注册失败'));
      } finally {
        loading.value = false;
      }
    };

    return {
      isLogin,
      loading,
      formRef,
      formData,
      formRules,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
}

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-header h2 {
  margin: 0;
}

.submit-button {
  width: 100%;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
}
</style>

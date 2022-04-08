import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import flushPromises from 'flush-promises'
import signup from '@/pages/signup.vue'
const localVue = createLocalVue()
localVue.use(Vuex)
// localVue内のstore作成
// eslint-disable-next-line import/no-named-as-default-member
const store = new Vuex.Store({
  modules: {
    user: {
      namespaced: true,
      state: {
        bio: '',
        follow: [],
        follower: [],
        icon: '',
        password: '',
        userId: 0,
        userName: '',
      },
      mutations: {
        setLoginUserInfo(state, user) {
          state.user = user
        },
      },
    },
  },
})
// routerをモックにする
const routermock = jest.fn()
const wrapper = mount(signup, {
  store,
  localVue,
  mocks: {
    $axios: {
      post: jest.fn(() => {
        return { data: { status: 'success' } }
      }),
    },
    $router: {
      push: routermock,
    },
  },
})
jest.mock('@/plugins/auth')
const inputName = wrapper.get('#inputName')
const inputPass = wrapper.get('#inputPassword')
const button = wrapper.find('button')

describe('会員登録画面', () => {
  beforeEach(() => {
    inputName.setValue('')
    inputPass.setValue('')
  })

  it('会員登録画面が表示されているか', () => {
    expect(wrapper.text()).toContain('Create user name')
  })

  it('パスワードが未入力の場合', async () => {
    inputName.setValue('test')
    await button.trigger('click')
    expect(wrapper.text()).toContain(
      'パスワードは半角英数字6字以上で入力してください'
    )
  })

  it('ユーザー名が未入力の場合', async () => {
    inputPass.setValue('test111')
    await button.trigger('click')
    expect(wrapper.text()).toContain('ユーザー名を入力してください')
  })

  it('ユーザーの形式が正しくない場合', async () => {
    inputName.setValue('あああ')
    inputPass.setValue('test111')
    await button.trigger('click')
    expect(wrapper.text()).toContain(
      'ユーザー名は半角英数記号で入力してください'
    )
  })

  it('ユーザー名が30文字以上の場合', async () => {
    inputName.setValue('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    inputPass.setValue('test111')
    await button.trigger('click')
    expect(wrapper.text()).toContain('ユーザー名は30字以内で入力してください')
  })

  it('パスワードの形式が正しくない場合', async () => {
    inputName.setValue('test')
    inputPass.setValue('test')
    await button.trigger('click')
    expect(wrapper.text()).toContain(
      'パスワードは半角英数字6字以上で入力してください'
    )
  })

  it('会員登録ができた場合', async () => {
    inputName.setValue('test')
    inputPass.setValue('test111')
    await button.trigger('click')
    await flushPromises()
    expect(routermock).toBeCalledWith('/home')
  })

  it('既に同じ名前のユーザーが存在していた場合', async () => {
    const failwrapper = mount(signup, {
      mocks: {
        $axios: {
          post: jest.fn(() => {
            return { data: { status: 'error' } }
          }),
        },
      },
    })
    failwrapper.get('#inputName').setValue('test')
    failwrapper.get('#inputPassword').setValue('test111')
    await failwrapper.find('button').trigger('click')
    await flushPromises()
    expect(failwrapper.text()).toContain('そのユーザー名は既に登録済みです')
  })
})

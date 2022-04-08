import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import flushPromises from 'flush-promises'
import home from '@/pages/home'
const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    user: {
      state: {
        user: {
          bio: '',
          follow: [],
          follower: [],
          icon: '',
          password: '',
          userId: 1,
          userName: '',
        },
      },
      getters: {
        /**
         * ログインしているユーザーの名前を取得する.
         * @param state -ステートオブジェクト
         * @returns ログインユーザーの名前
         */
        getLoginUserName(state) {
          return state.user.userName
        },
        /**
         * ログインしているユーザーIDを取得する.
         * @param state -ステートオブジェクト
         * @returns ログインユーザーID
         */
        getLoginUserId(state) {
          return state.user.userId
        },
        /**
         * ログインしたユーザーの情報を返す.
         * @param state ステート
         * @returns ログインしているユーザーの情報
         */
        getLoginUserInfo(state) {
          return state.user
        },
        getLoginStatus(state) {
          return state.isLogin
        },
      },
    },
  },
})
const wrapper = shallowMount(home, {
  stubs: ['PostDetail'],
  localVue,
  store,
  mocks: {
    $axios: {
      get: jest.fn(() => {
        return {
          data: [],
        }
      }),
    },
  },
})

describe('ホーム画面', () => {
  it('データがなにもないときの表示', async () => {
    await flushPromises()
    expect(wrapper.text()).toContain('When you follow people')
  })

  it('emitが渡ってきたときにメソッドが正しく動いているか', async () => {
    await flushPromises()
    // 特定の関数をモック化する
    const spy = jest.spyOn(wrapper.vm, 'getMyFollowUsersPost')
    // メソッドを発火させる
    wrapper.vm.emitUpdate()
    // spy関数が一度でも呼ばれたかのテスト
    expect(spy).toHaveBeenCalled()
  })
})

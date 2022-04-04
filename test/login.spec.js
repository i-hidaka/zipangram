import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Vuex from 'vuex'
import flushpromoses from 'flush-promises'
import index from '@/pages/index.vue'
const localVue = createLocalVue()
localVue.use(Vuex)
// eslint-disable-next-line import/no-named-as-default-member
const store = new Vuex.Store({
  // modulesの中にstoreでつけた名前つけて、namespacedプロパティtrueにすると、storeの名前分けに対応可能
  modules: {
    user: {
      namespaced: true,
      state: {
        user: {
          bio: '',
          follow: [],
          follower: [],
          icon: '',
          password: '',
          userId: 0,
          userName: '',
        },
      },
      mutations: {
        setLoginUserInfo(state, user) {
          state.user = user
        },
      },
    },
  },
})
jest.mock('@/plugins/auth')

describe('ログイン画面', () => {
  // ログインページをマウントする
  const routermock = jest.fn()
  const wrapper = mount(index, {
    localVue,
    store,
    stubs: { NuxtLink: RouterLinkStub },
    mocks: {
      $axios: {
        post: jest.fn().mockImplementationOnce(() => {
          return { data: { status: 'success', data: 'test' } }
        }),
      },
      $router: {
        push: routermock,
      },
    },
  })
  // wrapperからid:inputNameを見つけてくる(inputが1つのときはidつけなくても可能)
  const inputname = wrapper.get('#inputName')
  // wrapperからid:inputPasswordを見つけてくる
  const inputpass = wrapper.get('#inputPassword')
  // ボタンを見つけてくる
  const button = wrapper.find('button')
  // 全てのテストの前に一度input欄を何も入力していない状態にする
  beforeEach(() => {
    inputname.setValue('')
    inputpass.setValue('')
  })

  it('ユーザー名が未入力', async () => {
    // 見つけてきたinput欄に値を入れる
    inputpass.setValue('test')
    // ボタンを見つけ、クリックする(ボタンを押すときは async await)
    await button.trigger('click')
    expect(wrapper.text()).toContain('ユーザー名を入力してください')
  })

  it('パスワードが未入力', async () => {
    // 見つけてきたinput欄に値を入れる
    inputname.setValue('test')
    // ボタンを見つけ、クリックする(ボタンを押すときは async await)
    await button.trigger('click')
    expect(wrapper.text()).toContain('パスワードを入力してください')
  })

  it('ユーザー名、パスワードが未入力', async () => {
    // 見つけてきたinput欄に値を入れる
    inputname.setValue('')
    // 見つけてきたinput欄に値を入れる
    inputpass.setValue('')
    // ボタンを見つけ、クリックする(ボタンを押すときは async await)
    await button.trigger('click')
    expect(wrapper.text()).toContain('ユーザー名を入力してください')
    expect(wrapper.text()).toContain('パスワードを入力してください')
  })

  it('ログイン成功時', async () => {
    inputname.setValue('test')
    inputpass.setValue('test')
    await button.trigger('click')
    await flushpromoses()
    expect(routermock).toHaveBeenCalledWith('/home')
  })

  it('ログイン失敗時', async () => {
    // axios.postで失敗したときのwrapperを新たに作る
    const failwrapper = mount(index, {
      localVue,
      store,
      stubs: { NuxtLink: RouterLinkStub },
      mocks: {
        $axios: {
          post: jest.fn(() => {
            return { data: { status: 'error', data: 'test' } }
          }),
        },
      },
    })
    failwrapper.get('#inputName').setValue('test')
    failwrapper.get('#inputPassword').setValue('test')
    await failwrapper.find('button').trigger('click')
    await flushpromoses()
    expect(failwrapper.text()).toContain('ユーザー名とパスワードが一致しません')
  })
})

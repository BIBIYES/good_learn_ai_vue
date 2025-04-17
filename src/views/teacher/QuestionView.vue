<script setup>
import { Garage } from '@icon-park/vue-next'

</script>
<template>
  <div class="app p-4">
    <TitleBar>
      <template #title>
        <Garage
          theme="outline"
          size="38"
        />
        <span>我的题库</span>
      </template>
      <template #module>
        <div class="">
          <button
            class="btn btn-primary"
            onclick="my_modal_5.showModal()"
          >
            创建题库
          </button>
          <dialog
            id="my_modal_5"
            class="modal modal-bottom sm:modal-middle"
          >
            <div class="modal-box">
              <h3 class="text-lg font-bold">
                创建题库
              </h3>
              <p class="py-4">
                Press ESC key or click the button below to close
              </p>
              <div class="modal-action">
                <form method="dialog">
                  <!-- if there is a button in form, it will close the modal -->
                  <button class="btn">
                    Close
                  </button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
      </template>
    </TitleBar>
  </div>    
</template>
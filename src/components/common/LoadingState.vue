<template>
  <div class="my-loading">
    <div />
    <div />
    <div />
  </div>
</template>

<style>
.my-loading,
.my-loading > div {
  position: relative;
  box-sizing: border-box;
}

.my-loading {
  display: block;
  font-size: 0;
  color: #000;
}

.my-loading.la-dark {
  color: #333;
}

.my-loading > div {
  display: inline-block;
  float: none;
  background-color: currentColor;
  border: 0 solid currentColor;
}

.my-loading {
  width: 54px;
  height: 10px;
}

.my-loading > div:nth-child(1) {
  animation-delay: -200ms;
}

.my-loading > div:nth-child(2) {
  animation-delay: -100ms;
}

.my-loading > div:nth-child(3) {
  animation-delay: 0ms;
}

.my-loading > div {
  width: 5px;
  height: 5px;
  margin: 4px;
  border-radius: 100%;
  animation: ball-pulse 1s ease infinite;
}

.my-loading.la-sm {
  width: 26px;
  height: 8px;
}

.my-loading.la-sm > div {
  width: 4px;
  height: 4px;
  margin: 2px;
}

.my-loading.la-2x {
  width: 108px;
  height: 36px;
}

.my-loading.la-2x > div {
  width: 20px;
  height: 20px;
  margin: 8px;
}

.my-loading.la-3x {
  width: 162px;
  height: 54px;
}

.my-loading.la-3x > div {
  width: 30px;
  height: 30px;
  margin: 12px;
}

@keyframes ball-pulse {
  0%,
  60%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  30% {
    opacity: 0.1;
    transform: scale(0.01);
  }
}
</style>

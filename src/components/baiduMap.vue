<template>
  <div class="baidu-page">
    <div id="container"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, defineProps, watch } from "vue";

const props = defineProps(["mapLng", "mapLat", "mapZoom", "activeCity"]);

let mapRef = ref(null);

watch(
  props,
  (n, o) => {
    console.log(n, o, 444);
    var point = new BMap.Point(n.mapLng, n.mapLat);
    mapRef.value.panTo(point);
    mapRef.value.setZoom(13);

    // 点标记
    var marker = new BMap.Marker(n.mapLng, n.mapLat); // 创建标注
    mapRef.value.addOverlay(marker);

    // 绘制边界
    getBoundsary(n.activeCity);
  },
  {
    // immediate: true, // 先执行一次
    deep: true, // 深度监听，默认true
  }
);

onMounted(() => {
  console.log(props.mapLng);
  // 创建地图实例
  //   mapRef.value = new BMap("container", {
  mapRef.value = new BMap.Map("container", {
    coordsType: 5, // 坐标系类型 3为gcj02坐标，5为bd0ll坐标
  });
  // 创建点坐标
  var point = new BMap.Point(props.mapLng, props.mapLat);
  // 初始化地图，设置中心点坐标和地图级别
  mapRef.value.centerAndZoom(point, props.mapZoom);
  //开启鼠标滚轮缩放
  mapRef.value.enableScrollWheelZoom(true);

  // 自定义样式（控制台个性化样式中，穿件调整发布，生产id）
  mapRef.value.setMapStyleV2({
    styleId: "2dbb04b85ae274f51e0696320816677f",
  });
});

const getBoundsary = (city) => {
  var bdary = new BMap.Boundary();
  bdary.get(city, function (rs) {
    //获取行政区域
    mapRef.value.clearOverlays(); //清除地图覆盖物
    var count = rs.boundaries.length; //行政区域的点有多少个
    if (count === 0) {
      console.log("未能获取当前输入行政区域");
      return;
    }
    var pointArray = [];
    for (var i = 0; i < count; i++) {
      var ply = new BMap.Polygon(rs.boundaries[i], {
        strokeWeight: 2,
        strokeColor: "#FF8C00",
        fillColor: "rgba(255,255,255,0.1)",
      }); //建立多边形覆盖物
      mapRef.value.addOverlay(ply); //添加覆盖物
      pointArray = pointArray.concat(ply.getPath());
    }

    var ply = new BMap.Polygon(pointArray, {
      strokeWeight: 2,
      strokeColor: "#FF8C00",
      fillColor: "#f00",
    }); //建立多边形覆盖物

    mapRef.value.setViewport(pointArray); //调整视野
  });
};
</script>

<style lang="scss" scoped>
.baidu-page {
  width: 100%;
  height: 100%;
}
#container {
  width: 100%;
  height: 100%;
}
</style>

<!-- JavaScript API v3.0 官方文档 https://lbsyun.baidu.com/index.php?title=jspopular3.0/guide/geolocation -->

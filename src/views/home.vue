<template>
  <div class="home-page">
    <div class="map-echarts" id="main"></div>
    <div class="map-baidu">
      <baiduMap
        :mapLng="mapLng"
        :mapLat="mapLat"
        :mapZoom="mapZoom"
        :activeCity="activeCity"
      ></baiduMap>
      <!-- :key="new Date().getTime()" -->
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import * as echarts from "echarts";
// 引入百度地图
import baiduMap from "@/components/baiduMap.vue";
// 地区映射对象
import { provincesMap } from "@/utils/provincesMap";
// 地图渲染方法
import renderMap from "@/utils/renderMap";
//34个省、市、自治区的名字拼音映射数组
import { cityMap } from "@/utils/cityMap";
import { onMounted, ref } from "vue";

//直辖市和特别行政区-只有二级地图，没有三级地图
const special = ["北京", "天津", "上海", "重庆", "香港", "澳门"];
// 地图数据
let mapdata = [];

// 地图容器
const charRef = ref(null);
// 根据城市获取的经纬度
const mapLng = ref(108.089553);
const mapLat = ref(33.806161);
const mapZoom = ref(5);
const activeCity = ref(null);

// 初始化中国地图
const loadChina = async () => {
  let { data } = await axios.get("/map/china.json");
  // 将加载到的身份数据放到地图数据中
  mapdata = data.features.map((item) => ({ name: item.properties.name }));
  //注册地图
  echarts.registerMap("china", data);
  //绘制地图
  renderMap("china", mapdata, charRef);
};

// 根据城市名称获取经纬度
const getLnglat = async (params) => {
  let { data } = await axios.get(`/baiduApi/geocoding/v3/`, {
    params: {
      address: `${params.seriesName}${params.name}`,
      output: "json",
      // ak: "CtDFZnPIhj7MjWLllGtFNyLpT4MpgGwv",
      ak: "e4bgmoMcHhesd1fZrD2a6VgbQClcpV6z", // 百度地图引用服务端key
    },
  });

  mapLng.value = String(data.result.location.lng);
  mapLat.value = String(data.result.location.lat);
  activeCity.value = params.name;
};

onMounted(() => {
  console.log(echarts);
  // 地图容器
  charRef.value = echarts.init(document.getElementById("main"));
  // 注册点击事件
  charRef.value.on("click", async (params) => {
    console.log(params);
    // 如果点击的是34个省、市、自治区，绘制选中地区的二级地图
    if (params.name in provincesMap) {
      // 如果点击的 params.name 在身份映射表中，说明这是省
      let { data } = await axios.get(
        `/map/province/${provincesMap[params.name]}.json`
      );
      // console.log(data);

      echarts.registerMap(params.name, data);
      renderMap(
        params.name,
        data.features.map((item) => ({ name: item.properties.name })),
        charRef
      );
    } else if (params.seriesName in provincesMap) {
      // 如果点击的 params.seriesName 上级名称在身份映射表中，说明这是市
      if (special.includes(params.seriesName)) {
        // 如果是【直辖市/特别行政区】只有二级下钻
        // renderMap("china", mapdata);
        getLnglat(params);
      } else {
        //显示县级地图
        let { data } = await axios.get(
          `/map/city/${cityMap[params.name]}.json`
        );

        echarts.registerMap(params.name, data);
        renderMap(
          params.name,
          data.features.map((item) => ({ name: item.properties.name })),
          charRef
        );
      }
    } else {
      getLnglat(params);
    }
  });
  // 注册双击返回事件
  charRef.value.on("dblclick", () => {
    renderMap("china", mapdata, charRef);
  });

  // 加载
  loadChina();
});
</script>

<style lang="scss" scoped>
.home-page {
  width: 100%;
  height: 100%;
  display: flex;
  .map-echarts {
    flex: 1;
  }
  .map-baidu {
    flex: 1;
  }
}
</style>

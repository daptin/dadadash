<template>

  <q-page-container style="padding-top: 0">
    <q-page style="height:calc(100vh  - 75px);">
      <div class="row">
        <div style="max-width: 250px" :class="{'col-2 col-sm-3': showSideBar}">
          <!--          <div class="row q-pa-md">-->
          <!--            <div class="col-12">-->
          <!--              &nbsp;<q-btn style="border: 1px solid black" flat label="Today"-->
          <!--                           @click="setDate()"></q-btn>-->
          <!--            </div>-->
          <!--          </div>-->
          <div class="row" v-if="showSideBar">
            <div class="col-12">
              <q-date
                v-model="date"
                @input="setDate"
                today-btn
                minimal
                flat
                style="background: transparent; width: 200px; min-width: 0px"
              />
            </div>
            <div class="col-12 q-pa-md" style="display: none">
              <div @drop="eventTrashed" class="text-center vertical-middle trash-box"
                   style="height: 100px; width: 100%; border: 1px solid red; padding: 5px; border-radius: 5px">
                <br/>
                <q-icon size="3em" name="fas fa-trash"></q-icon>
                <br/>
                <span class="text-small">Drop events here to delete them</span>
              </div>
            </div>
          </div>
        </div>
        <div style="border-left: 1px solid black" :class="{'col-10 col-sm-9': showSideBar, 'col-12': !showSideBar}">
          <div class="row">
            <div class="col-12">
              <q-toolbar>
                <q-btn style="border: 1px solid black" flat label="Today"
                       @click="setDate()"></q-btn>


                <q-btn flat @click="calendar.refetchEvents()" icon="fas fa-sync-alt"></q-btn>
                <span v-if="calendar" class="text-h6">{{
                    monthNames[calendar.getDate().getMonth()]
                  }} {{ calendar.getDate().getFullYear() }}</span>
                <q-btn @click="(showEventDialogTarget = true) && (showEventDialog = true)" icon="fas fa-plus" flat>
                  <q-menu :target="showEventDialogTarget" ref="newEventDialog" style="overflow: hidden">
                    <q-bar class="bg-black text-white">
                      <span class="text-weight-bold ">
                        New event
                      </span>
                    </q-bar>
                    <q-card style="min-width: 450px; overflow: hidden;" class="q-pa-md bg-white">

                      <q-card-section>
                        <q-input label="Title" v-model="newEvent.title"></q-input>
                      </q-card-section>
                      <q-card-section style="padding-left: 10px">
                        <div class="row">
                          <div class="col-6">
                            <q-btn-toggle size="sm" style="padding: 5px;" dense v-model="newEvent.type" flat
                                          :options="[
                              {label: 'Event', value: 'event'},
                              {label: 'Reminder', value: 'reminder'},
                              {label: 'Task', value: 'task'}
                        ]">
                            </q-btn-toggle>
                          </div>
                          <div class="col-6">
                            <q-checkbox v-model="newEvent.allDay" label="Full day event"></q-checkbox>
                          </div>
                        </div>


                      </q-card-section>

                      <q-tab-panels v-model="newEvent.type" class="shadow-2 rounded-borders bg-transparent">
                        <q-tab-panel class="new-event-panel" name="event">
                          <q-card-section>

                            <q-input label="Event date and time" filled v-model="newEvent.start">
                              <template v-slot:prepend>
                                <q-icon name="event" class="cursor-pointer">
                                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                                    <q-date v-model="newEvent.start" mask="YYYY-MM-DD HH:mm">
                                      <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat/>
                                      </div>
                                    </q-date>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>

                              <template v-slot:append>
                                <q-icon name="access_time" class="cursor-pointer">
                                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                                    <q-time v-model="newEvent.start" mask="YYYY-MM-DD HH:mm" format24h>
                                      <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat/>
                                      </div>
                                    </q-time>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input>

                          </q-card-section>

                          <q-card-section v-if="newEventConfig.showAddDescription">
                            <q-editor label="Description" v-model="newEvent.description">
                            </q-editor>
                          </q-card-section>
                          <q-card-section v-if="newEventConfig.showAddLocation">
                            <q-input label="Event location" v-model="newEvent.location">
                            </q-input>
                          </q-card-section>
                        </q-tab-panel>

                        <q-tab-panel class="new-event-panel" name="reminder">
                          <q-card-section>

                            <q-input label="Event date and time" filled v-model="newEvent.start">
                              <template v-slot:prepend>
                                <q-icon name="event" class="cursor-pointer">
                                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                                    <q-date v-model="newEvent.start" mask="YYYY-MM-DD HH:mm">
                                      <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat/>
                                      </div>
                                    </q-date>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>

                              <template v-slot:append>
                                <q-icon name="access_time" class="cursor-pointer">
                                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                                    <q-time v-model="newEvent.start" mask="YYYY-MM-DD HH:mm" format24h>
                                      <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat/>
                                      </div>
                                    </q-time>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input>
                          </q-card-section>

                        </q-tab-panel>

                        <q-tab-panel class="new-event-panel" name="task">

                          <q-card-section>
                            <q-input label="Event date and time" filled v-model="newEvent.start">
                              <template v-slot:prepend>
                                <q-icon name="event" class="cursor-pointer">
                                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                                    <q-date v-model="newEvent.start" mask="YYYY-MM-DD HH:mm">
                                      <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat/>
                                      </div>
                                    </q-date>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>

                              <template v-slot:append>
                                <q-icon name="access_time" class="cursor-pointer">
                                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                                    <q-time v-model="newEvent.start" mask="YYYY-MM-DD HH:mm" format24h>
                                      <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat/>
                                      </div>
                                    </q-time>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input>
                          </q-card-section>

                        </q-tab-panel>
                      </q-tab-panels>


                      <q-card-actions align="right">
                        <q-btn class="float-right " style="border: 1px solid black" @click="createEvent()" flat
                               label="Save">

                        </q-btn>
                      </q-card-actions>
                    </q-card>
                  </q-menu>
                </q-btn>

                <q-btn icon="fas fa-angle-left" @click="calendar.prev()" flat></q-btn>
                <q-btn icon="fas fa-angle-right" @click="calendar.next()" flat></q-btn>
                <q-space/>
                <q-btn-dropdown :label="calendarView" flat>
                  <q-list>
                    <q-item v-close-popup @click="setCalendarView('day')" clickable>
                      <q-item-section>Day</q-item-section>
                    </q-item>
                    <q-item v-close-popup @click="setCalendarView('week')" clickable>
                      <q-item-section>Week</q-item-section>
                    </q-item>
                    <q-item v-close-popup @click="setCalendarView('month')" clickable>
                      <q-item-section>Month</q-item-section>
                    </q-item>
                    <q-item v-close-popup @click="setCalendarView('schedule')" clickable>
                      <q-item-section>Day Schedule</q-item-section>
                    </q-item>
                    <q-item v-close-popup @click="setCalendarView('week schedule')" clickable>
                      <q-item-section>Week Schedule</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </q-toolbar>
            </div>
            <div class="col-12 " style="height: calc(100vh - 100px);">
              <div class="my-calendar-container1 q-pa-md" style="height: calc(100vh - 200px)" :id="containerId"></div>
            </div>
          </div>
        </div>

      </div>
    </q-page>
  </q-page-container>


</template>
<style>
.trash-box:hover {
  color: red;
}

.new-event-panel .q-card__section {
  padding: 0;
}

.q-btn-toggle button.q-btn {
  padding: 5px;
}

.fc .fc-list-sticky .fc-list-day > * {
  background: transparent;
}

.fc .fc-list-event:hover td {
}
</style>
<script>
import {Calendar} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {mapActions} from "vuex";
import {v4 as uuidv4} from "uuid";


const DEFAULT_OPTIONS = {
  initialView: 'dayGridMonth',
  selectable: true,
  editable: true,
  nowIndicator: true,
  height: document.body.scrollHeight - 200,
  headerToolbar: {
    start: '', // will normally be on the left. if RTL, will be on the right
    center: '',
    end: '' // will normally be on the right. if RTL, will be on the left
  },
  buttonIcons: {
    prev: 'left-single-arrow',
    next: 'right-single-arrow',
    prevYear: 'left-double-arrow',
    nextYear: 'right-double-arrow'
  },
  buttonText: {
    today: 'today',
    month: 'month',
    next: '>',
    prev: '<',
    week: 'week',
    day: 'day',
    list: 'list'
  },
  navLinks: true,
  events: [],
};

export default {

  name: "Calendar",
  data() {
    return {
      searchInput: '',
      calendarConfig: null,
      showEventDialog: false,
      showEventDialogTarget: true,
      monthNames: ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ],
      pdate: new Date(),
      newEventConfig: {
        showAddDescription: false,
        showAddLocation: false,
      },
      newEvent: {},
      calendarView: 'month',
      date: new Date(),
      showSearchInput: false,
      calendar: null,
      showUploadComponent: false,
      showSideBar: true,
      viewParameters: {
        tableName: 'document'
      },
      containerId: "id-" + new Date().getMilliseconds(),
      screenWidth: (window.screen.width < 1200 ? window.screen.width : 1200) + "px",
      eventMap: {}
    }
  },
  methods: {
    generateNewEvent() {
      return {
        id: uuidv4(),
        groupId: uuidv4(),
        title: 'New event',
        url: '',
        type: 'event',
        classNames: '',
        editable: true,
        startEditable: true,
        durationEditable: true,
        resourceEditable: true,
        display: 'auto',
        overlap: true,
        description: null,
        constraint: null,
        backgroundColor: null,
        borderColor: null,
        textColor: null,
        extendedProps: null,
        source: null,
        location: null,
        allDay: false,
        start: new Date(),
        startStr: "",
        end: null,
        endStr: "",
      }
    },
    eventTrashed() {
      console.log("Event trashed", arguments)
    },
    ...mapActions(['createRow', "loadData", "updateRow"]),
    createEvent() {
      const that = this;
      window.thatRef = that;
      console.log("Create new event", this.newEvent);
      that.calendar.addEvent({...this.newEvent}, true);
      this.newEvent = this.generateNewEvent();
      that.$refs.newEventDialog.hide();
      that.saveCalendar()
    },
    setDate(date) {
      console.log("set date", date)
      if (!date) {
        date = new Date();
      } else {
        date = new Date(Date.parse(date));
      }
      this.date = date;
      this.calendar.gotoDate(date);
    },
    setCalendarView(view) {
      this.calendarView = view;
      switch (view) {
        case "week":
          this.calendar.changeView('timeGridWeek');
          return;
        case "day":
          this.calendar.changeView('timeGridDay');
          return;
        case "month":
          this.calendar.changeView('dayGridMonth');
          return;
        case "schedule":
          this.calendar.changeView('listDay');
          return;
        case "week schedule":
          this.calendar.changeView('listWeek');
          return;
      }
    },
    addNewEvent() {
      console.log("Add new event")
    },
    eventDrop(dropInfo) {
      const that = this;
      console.log("drop info", dropInfo)
      that.saveCalendar()
    },
    dateClickedEvent(info) {
      const that = this;
      if (that.showEventDialog) {
        that.showEventDialogTarget = true;
        that.showEventDialog = false;
        that.$refs.newEventDialog.hide();
        return
      }
      console.log('Clicked on : ', info);
      that.newEvent.start = info.date;
      that.showEventDialog = true;
      that.showEventDialogTarget = info.dayEl;
      that.$refs.newEventDialog.show();
      // change the day's background color just for fun
      // info.dayEl.style.backgroundColor = 'red';
    },
    fetchEvents(info, successCallback, failureCallback) {
      const that = this;
      if (!that.calendar || !that.calendar.events) {
        console.log("Fetch events early return", info, that.calendarConfig.events);
        return that.calendarConfig.events ? successCallback(that.calendarConfig.events) : successCallback([]);
      }
      console.log("Fetch events", info, that.calendar.events);
      successCallback(that.calendar.events)
    },
    saveCalendar() {
      const that = this;

      that.calendarConfig.events = that.calendar.getEvents();
      console.log("Calender events", that.calendarConfig);
      that.$emit("save-base-item-contents", btoa(JSON.stringify(that.calendarConfig)))

    },
    eventResize(dropInfo) {
      const that = this;
      console.log("event resized", dropInfo, that.calendar)
      that.saveCalendar();
    }
  },
  computed: {},

  watch: {
    'date': function () {
      console.log("Date changed", this.date.toString())
      // this.calendar.gotoDate(this.date.toString())
    }
  },
  beforeDestroy() {
    window.onresize = null;
  },
  props: ["baseItem"],
  mounted() {
    const that = this;
    that.containerId = "id-" + new Date().getMilliseconds();
    console.log("Mounted Calendar", that.containerId, this.baseItem);
    that.newEvent = that.generateNewEvent();
    that.eventMap = {
      eventResize: that.eventResize,
      events: that.fetchEvents,
      dateClick: that.dateClickedEvent,
      eventDrop: that.eventDrop,
    }
    var file = this.baseItem.file;
    var calendarConfig = DEFAULT_OPTIONS;
    if (file) {
      try {
        var savedConfig = JSON.parse(atob(file))
        calendarConfig = savedConfig;
        console.log("Restore saved calendar", calendarConfig)
      } catch (e) {
        console.log("Failed to parse existing data", e)
      }
    }
    that.calendarConfig = calendarConfig;

    window.onresize = function () {
      if (document.body.clientWidth > 1400 && !that.showSideBar) {
        that.showSideBar = true;
      } else if (document.body.clientWidth < 1400 && that.showSideBar) {
        that.showSideBar = false;
      }
    }
    window.onresize();

    setTimeout(function () {
      that.calendar = new Calendar(document.getElementById(that.containerId),
        {
          ...that.calendarConfig,
          ...that.eventMap,
          plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
        });
      that.calendar.render();
    }, 200)
  }
}
</script>

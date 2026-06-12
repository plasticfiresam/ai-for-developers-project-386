import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

/**
 * API сервиса «Запись на звонок».
 *
 * Роли:
 * - Владелец календаря — один предустановленный профиль, админ-раздел без аутентификации.
 * - Гость — анонимный, идентифицируется `guestId` (UUID v4) из localStorage.
 *
 * Ключевые правила:
 * - Длительность встречи задаётся типом события (`EventType`).
 * - Окно бронирования: 14 дней от текущей даты (включительно).
 * - На одно время нельзя две записи, даже разных типов событий.
 * - Рабочие часы: 09:00–19:00.
 *
 * Таймзона: фиксированная (например, Europe/Moscow).
 */
@service(#{ title: "Call Booking API" })
@server("http://localhost:3000", "Local development")
@server("https://api.example.com", "Production")
namespace CallBooking;

/** Статус слота в UI. */
enum SlotStatus {
  available,
  booked,
  past,
}

enum ErrorCode {
  validation_error,
  slot_conflict,
  not_found,
  duplicate_id,
  has_upcoming_bookings,
  internal_error,
}

@error
model ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string>;
}

/** Тип события — шаблон встречи, создаётся владельцем. */
model EventType {
  /** Уникальный идентификатор, задаёт владелец (например "intro-30"). */
  id: string;

  name: string;
  description: string;

  /** Длительность в минутах. Определяет сетку слотов. */
  @minValue(1)
  durationMinutes: int32;

  @format("date-time")
  createdAt: utcDateTime;
}

model CreateEventTypeRequest {
  id: string;
  name: string;
  description: string;

  @minValue(1)
  durationMinutes: int32;
}

/** Тело запроса на обновление типа. Поле `id` неизменяемо. */
model UpdateEventTypeRequest {
  name: string;
  description: string;

  @minValue(1)
  durationMinutes: int32;
}

model EventTypeListResponse {
  items: EventType[];
  total: int32;
}

/** Бронирование. */
model Booking {
  id: uuid;
  guestId: uuid;
  eventTypeId: string;

  /** Денормализованное название типа для списков. */
  eventTypeName: string;

  @format("date")
  date: plainDate;

  @pattern("^([01]\\d|2[0-3]):[0-5]\\d$")
  startTime: string;

  durationMinutes: int32;

  @pattern("^([01]\\d|2[0-3]):[0-5]\\d$")
  endTime: string;

  @format("date-time")
  createdAt: utcDateTime;
}

model CreateBookingRequest {
  guestId: uuid;
  eventTypeId: string;

  @format("date")
  date: plainDate;

  @pattern("^([01]\\d|2[0-3]):[0-5]\\d$")
  startTime: string;
}

model BookingListResponse {
  items: Booking[];
  total: int32;
}

model Slot {
  @format("date")
  date: plainDate;

  @pattern("^([01]\\d|2[0-3]):[0-5]\\d$")
  startTime: string;

  durationMinutes: int32;

  @pattern("^([01]\\d|2[0-3]):[0-5]\\d$")
  endTime: string;

  status: SlotStatus;
}

model DayAvailability {
  @format("date")
  date: plainDate;

  /** Свободные слоты выбранного типа события. */
  freeSlotCount: int32;

  totalSlotCount: int32;

  /** false для дат вне 14-дневного окна или в прошлом. */
  isSelectable: boolean;
}

model DaySlotsResponse {
  eventTypeId: string;

  @format("date")
  date: plainDate;

  durationMinutes: int32;
  slots: Slot[];
}

model CalendarResponse {
  eventTypeId: string;
  durationMinutes: int32;

  /** Первый день окна (сегодня). */
  @format("date")
  windowStart: plainDate;

  /** Последний день окна (сегодня + 13). */
  @format("date")
  windowEnd: plainDate;

  days: DayAvailability[];
}

@route("/event-types")
namespace EventTypes {
  /**
   * Список типов событий для гостевой страницы и админки.
   */
  @get
  @doc("Список типов событий")
  op list(): {
    @statusCode statusCode: 200;
    @body response: EventTypeListResponse;
  };

  /**
   * Создать тип события (владелец).
   *
   * Валидация:
   * - `id` уникален;
   * - `durationMinutes` позволяет хотя бы один слот в 09:00–19:00.
   */
  @post
  @doc("Создать тип события")
  op create(@body body: CreateEventTypeRequest):
    | {
        @statusCode statusCode: 201;
        @body eventType: EventType;
      }
    | {
        @statusCode statusCode: 400;
        @body error: ErrorResponse;
      }
    | {
        @statusCode statusCode: 409;
        @body error: ErrorResponse;
      };

  @get
  @route("{eventTypeId}")
  @doc("Получить тип события по id")
  op getById(@path eventTypeId: string):
    | {
        @statusCode statusCode: 200;
        @body eventType: EventType;
      }
    | {
        @statusCode statusCode: 404;
        @body error: ErrorResponse;
      };

  /**
   * Обновить тип события (владелец).
   *
   * Изменяются `name`, `description`, `durationMinutes`.
   * `id` не меняется. Существующие бронирования сохраняют
   * durationMinutes на момент создания.
   */
  @patch(#{ implicitOptionality: true })
  @route("{eventTypeId}")
  @doc("Обновить тип события")
  op update(
    @path eventTypeId: string,
    @body body: UpdateEventTypeRequest,
  ):
    | {
        @statusCode statusCode: 200;
        @body eventType: EventType;
      }
    | {
        @statusCode statusCode: 400;
        @body error: ErrorResponse;
      }
    | {
        @statusCode statusCode: 404;
        @body error: ErrorResponse;
      };

  /**
   * Удалить тип события (владелец).
   *
   * Запрещено, если есть предстоящие бронирования на этот тип.
   */
  @delete
  @route("{eventTypeId}")
  @doc("Удалить тип события")
  op delete(@path eventTypeId: string):
    | {
        @statusCode statusCode: 204;
      }
    | {
        @statusCode statusCode: 404;
        @body error: ErrorResponse;
      }
    | {
        @statusCode statusCode: 409;
        @body error: ErrorResponse;
      };
}

@route("/bookings")
namespace Bookings {
  /**
   * Создать бронирование.
   *
   * `durationMinutes` берётся из типа события на сервере.
   *
   * Проверяет:
   * - дата в окне [today, today + 13];
   * - рабочие часы 09:00–19:00;
   * - время не в прошлом;
   * - отсутствие пересечения с ЛЮБЫМИ бронированиями на дату
   *   (независимо от eventTypeId).
   */
  @post
  @doc("Забронировать слот")
  op create(@body body: CreateBookingRequest):
    | {
        @statusCode statusCode: 201;
        @body booking: Booking;
      }
    | {
        @statusCode statusCode: 400;
        @body error: ErrorResponse;
      }
    | {
        @statusCode statusCode: 404;
        @body error: ErrorResponse;
      }
    | {
        @statusCode statusCode: 409;
        @body error: ErrorResponse;
      };

  /**
   * Бронирования гостя («Мои записи»).
   *
   * По умолчанию только предстоящие (`upcoming=true`).
   */
  @get
  @doc("Список бронирований гостя")
  op listByGuest(
    /** UUID гостя из localStorage. Обязателен. */
    @query guestId: uuid,

    /** Если true (по умолчанию) — только будущие записи. */
    @query upcoming?: boolean = true,
  ):
    | {
        @statusCode statusCode: 200;
        @body response: BookingListResponse;
      }
    | {
        @statusCode statusCode: 400;
        @body error: ErrorResponse;
      };

  @get
  @route("{bookingId}")
  @doc("Получить бронирование по id")
  op getById(@path bookingId: uuid):
    | {
        @statusCode statusCode: 200;
        @body booking: Booking;
      }
    | {
        @statusCode statusCode: 404;
        @body error: ErrorResponse;
      };
}

@route("/bookings/upcoming")
namespace UpcomingBookings {
  /**
   * Предстоящие встречи владельца.
   *
   * Все типы событий в одном списке.
   * Только записи с start > now, сортировка date + startTime asc.
   */
  @get
  @doc("Предстоящие встречи владельца")
  op list(): {
    @statusCode statusCode: 200;
    @body response: BookingListResponse;
  };
}

@route("/days")
namespace Days {
  /**
   * Слоты конкретного дня для выбранного типа события.
   *
   * Занятость считается по всем бронированиям на дату.
   * Дата должна быть в 14-дневном окне.
   */
  @get
  @route("{date}/slots")
  @doc("Слоты дня")
  op getSlots(
    @path
    @format("date")
    date: plainDate,

    @query eventTypeId: string,
  ):
    | {
        @statusCode statusCode: 200;
        @body response: DaySlotsResponse;
      }
    | {
        @statusCode statusCode: 400;
        @body error: ErrorResponse;
      }
    | {
        @statusCode statusCode: 404;
        @body error: ErrorResponse;
      };
}

@route("/calendar")
namespace Calendar {
  /**
   * Календарь 14-дневного окна для типа события.
   *
   * Возвращает по одному элементу на каждый день
   * [windowStart, windowEnd] с freeSlotCount.
   */
  @get
  @doc("Календарь 14-дневного окна")
  op getWindow(
    @query eventTypeId: string,
  ):
    | {
        @statusCode statusCode: 200;
        @body response: CalendarResponse;
      }
    | {
        @statusCode statusCode: 404;
        @body error: ErrorResponse;
      };
}

@route("/health")
namespace Health {
  @get
  op check(): {
    @statusCode statusCode: 200;
    @body status: "ok";
  };
}

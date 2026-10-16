package app.bonafide.api;

import app.bonafide.cases.CaseService;
import app.bonafide.demo.DemoService;
import jakarta.validation.ConstraintViolationException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Every error becomes the contract error JSON (contract §4.7). */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(CaseService.NotFound.class)
    public ResponseEntity<Map<String, Object>> notFound(CaseService.NotFound e) {
        return error(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found.");
    }

    @ExceptionHandler(Busy.class)
    public ResponseEntity<Map<String, Object>> busy(Busy e) {
        return error(HttpStatus.CONFLICT, "BUSY", "Agents are still working on this case.");
    }

    @ExceptionHandler(DemoService.DemoOff.class)
    public ResponseEntity<Map<String, Object>> demoOff(DemoService.DemoOff e) {
        return error(HttpStatus.FORBIDDEN, "DEMO_OFF", "Demo mode is off.");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> badRequest(IllegalArgumentException e) {
        return error(HttpStatus.BAD_REQUEST, "BAD_REQUEST", e.getMessage());
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class})
    public ResponseEntity<Map<String, Object>> badRequest(Exception e) {
        return error(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "The request is not valid.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> internal(Exception e) {
        log.error("Unhandled error", e);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL", "Something went wrong on our side.");
    }

    private static ResponseEntity<Map<String, Object>> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(Map.of("error", Map.of("code", code, "message", message)));
    }
}

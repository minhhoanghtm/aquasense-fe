import sys

with open("src/pages/ForgotPassword/index.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix handleSendOtp
content = content.replace('''    } catch (err: any) {
      // Tự động chuyển sang chế độ Test/Mock
      console.warn("Chế độ thử nghiệm OTP:", err);
      setSuccessMessage("Mã OTP thử nghiệm: 123456");
      setCountdown(60);
      setStep(2);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } finally {''', '''    } catch (err: any) {
      setErrorMessage(err?.message || "Không thể gửi OTP. Vui lòng kiểm tra lại thông tin.");
    } finally {''')

# Fix handleResendOtp
content = content.replace('''    } catch {
      setCountdown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMessage("Mã OTP thử nghiệm: 123456");
      setTimeout(() => setSuccessMessage(null), 4000);
      otpInputsRef.current[0]?.focus();
    } finally {''', '''    } catch (err: any) {
      setErrorMessage(err?.message || "Không thể gửi lại OTP.");
    } finally {''')

# Fix handleVerifyOtp
content = content.replace('''      await verifyOtp(identifier.trim(), otpCode);
      setStep(3);
    } catch {
      setStep(3);
    } finally {''', '''      await verifyOtp(identifier.trim(), otpCode, "RESET_PASSWORD");
      setStep(3);
    } catch (err: any) {
      setErrorMessage(err?.message || "Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {''')

# Fix resetPassword
content = content.replace('''      await resetPassword(identifier.trim(), newPassword, otpCode);
      setStep(4);
    } catch {
      setStep(4);
    } finally {''', '''      await resetPassword(identifier.trim(), newPassword, otpCode);
      setStep(4);
    } catch (err: any) {
      setErrorMessage(err?.message || "Đã xảy ra lỗi khi đổi mật khẩu.");
    } finally {''')

# Also fix the initial sendOtp call to pass "RESET_PASSWORD"
content = content.replace('''      const res = await sendOtp(cleanVal);''', '''      const res = await sendOtp(cleanVal, "RESET_PASSWORD");''')
content = content.replace('''      const res = await sendOtp(identifier.trim());''', '''      const res = await sendOtp(identifier.trim(), "RESET_PASSWORD");''')

with open("src/pages/ForgotPassword/index.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed")

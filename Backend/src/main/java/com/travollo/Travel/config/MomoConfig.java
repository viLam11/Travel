package com.travollo.Travel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MomoConfig {
    @Value("${momo.partner_code}")
    public String PARTNER_CODE;
    @Value("${momo.access_key}")
    public String ACCESS_KEY;
    @Value("${momo.secret_key}")
    public String SECRET_KEY;
    @Value("${momo.pay_query_status_url}")
    public String PAY_QUERY_STATUS_URL;
    @Value("${momo.pay_confirm_url}")
    public String PAY_CONFIRM_URL;
    @Value("${momo.return_url}")
    public String RETURN_URL;
    @Value("${momo.notify_url}")
    public String NOTIFY_URL;
    @Value("${momo.ipn_url}")
    public String IPN_URL;
    @Value("${momo.create_order_url}")
    public String CREATE_ORDER_URL;
    @Value("${momo.redirect_url}")
    public String REDIRECT_URL;
}
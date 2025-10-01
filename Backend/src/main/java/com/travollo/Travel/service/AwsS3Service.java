package com.travollo.Travel.service;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.travollo.Travel.exception.CustomException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class AwsS3Service {
    private final String bucketName = "travello-bucket-2004";
//    @Value("${aws.s3.access.key}")
    private String awsS3AccessKey;

//    @Value("${aws.s3.secret.key}")
    private String awsS3ASecretKey;

    public String saveImageToS3(MultipartFile photo) {
        String s3LocationImg = null;
        try {
            String S3Filename = photo.getOriginalFilename();
            BasicAWSCredentials awsCredentials = new BasicAWSCredentials(awsS3AccessKey, awsS3ASecretKey);
            AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                    .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                    .withRegion(Regions.AP_NORTHEAST_1)
                    .build();

            InputStream inputStream = photo.getInputStream();

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType("image/jpeg");

            PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, S3Filename, inputStream, metadata );
            s3Client.putObject(putObjectRequest);

            s3LocationImg = "https://" + bucketName + ".s3.amazonaws.com/" + S3Filename;
            return s3LocationImg;

        } catch (Exception e) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Image upload failed");
        }
    }
}
